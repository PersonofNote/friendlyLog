
import { NextRequest, NextResponse } from "next/server";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

export default async function handler(req: NextRequest, res: NextResponse) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

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
}
