import { NextRequest, NextResponse } from "next/server";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { createClient } from "@/utils/supabase/server";
import { getLogGroups } from "./getLogGroups";


const sts = new STSClient({ region: "us-east-1" });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { roleArn } = await req.json();

  if (!roleArn) {
    return NextResponse.json({ error: "Missing Role ARN" }, { status: 400 });
  }

  // Get Supabase session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  // Consider moving this to the aws_connections table and creating that row on user creation
  const { data: externalData, error: externalError } = await supabase
    .from("profiles")
    .select("external_id")
    .eq("id", userId)
    .single();

  if (externalError || !externalData?.external_id) {
    return NextResponse.json({ error: "Missing external ID" }, { status: 400 });
  }

  const externalId = externalData.external_id;

  try {
    const command = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: `FriendlyLog-${userId}`,
      ExternalId: externalId,
      DurationSeconds: 900, // 15 min session
    });

    const response = await sts.send(command);

    if (!response.Credentials) {
      throw new Error("Invalid credentials");
    }

    // Save the role ARN to DB - Consider letting this also be an update in case you've already created the row
    const { error: saveError } = await supabase
      .from("aws_connections")
      .insert({ role_arn: roleArn, external_id: externalId, user_id: userId });

    if (saveError) {
      throw saveError;
    }

    try {
      const groups = await getLogGroups(roleArn, externalId);
      console.log("Groups", groups)
      return NextResponse.json({ success: true, groupNames: groups.groupNames, message: "Successfully connected to AWS" }, { status: 200 });
    } catch (err: any) {
      console.error("Log fetch error:", err);
      return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("AssumeRole failed:", err);
    return NextResponse.json(
      { error: "Could not assume role. Please check the ARN and external ID." },
      { status: 403 }
    );
  }
}
