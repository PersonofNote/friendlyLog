
//import { CloudWatchLogsClient, FilterLogEventsCommand } from "@aws-sdk";
import { NextRequest, NextResponse } from "next/server";
import { getRecentLogs } from "./getRecentLogs";
import { createClient } from "@/utils/supabase/server";
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";


export async function POST(req: NextRequest) {
  const { roleArn, logGroupName } = await req.json();

  console.log(roleArn, logGroupName)

  if (!roleArn || !logGroupName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Step 1: Assume Role using FriendlyLog's credentials
    const stsClient = new STSClient({
      region: "us-east-1", // update to your customer's region if needed
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const assumeCommand = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: "FriendlyLogSession",
      DurationSeconds: 900,
    });

    const assumed = await stsClient.send(assumeCommand);

    if (!assumed.Credentials) {
      throw new Error("Invalid credentials");
    };

    // Step 2: Use temporary credentials to fetch logs
    const logsClient = new CloudWatchLogsClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: assumed.Credentials?.AccessKeyId!,
        secretAccessKey: assumed.Credentials?.SecretAccessKey!,
        sessionToken: assumed.Credentials?.SessionToken!,
      },
    });

    const logCommand = new FilterLogEventsCommand({
      logGroupName,
      limit: 20,
    });

    const logs = await logsClient.send(logCommand);

    console.log(logs)

    return NextResponse.json({
      success: true,
      events: logs.events || [],
    });
  } catch (error) {
    console.error("AWS error:", error);
    return NextResponse.json({ error: "Failed to assume role or fetch logs" }, { status: 500 });
  }
};

export async function GET(req: NextRequest) {
  console.log("route hit")
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("aws_connections")
    .select("role_arn, external_id")
    .eq("user_id", user.id)
    .single();

    console.log("DATA", data)

  if (error || !data?.role_arn || !data?.external_id) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  try {
    const logs = await getRecentLogs(data.role_arn, data.external_id);
    console.log("🪵", logs)
    return NextResponse.json(logs);
  } catch (err: any) {
    console.error("Log fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

/*
export default async function handler(req: NextRequest, res: NextResponse) {
  const client = new CloudWatchLogsClient({
    region: "us-east-1", // replace with your region
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    const command = new FilterLogEventsCommand({
      logGroupName: "/aws/lambda/your-log-group", // replace with your log group
      limit: 50,
    });

    const response = await client.send(command);
    res.status(200).json(response.events || []);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
}
  */
