import { NextRequest, NextResponse } from "next/server";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { createClient } from "@/utils/supabase/server";


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

  // Fetch external ID from DB
  const { data: externalData, error: externalError } = await supabase
    .from("profiles")
    .select("external_id")
    .eq("id", userId)
    .single();

  if (externalError || !externalData?.external_id) {
    return NextResponse.json({ error: "Missing external ID" }, { status: 400 });
  }

  const externalId = externalData.external_id;

  // Try to assume the role
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

    // Save the role ARN to DB
    /*
    const { error: saveError } = await supabase
      .from("aws_connections")
      .update({ role_arn: roleArn, connected_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (saveError) {
      throw saveError;
    }
      */

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("AssumeRole failed:", err);
    return NextResponse.json(
      { error: "Could not assume role. Please check the ARN and external ID." },
      { status: 403 }
    );
  }
}
