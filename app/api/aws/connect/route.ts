import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getLogGroups } from "./getLogGroups";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { roleArn } = await req.json();

  if (!roleArn) {
    return NextResponse.json({ error: "Missing Role ARN" }, { status: 400 });
  }


  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const { data: externalData, error: externalError } = await supabase
    .from("friendlylog_user_settings")
    .select("external_id")
    .eq("user_id", userId)
    .single();

  if (externalError || !externalData?.external_id) {
    return NextResponse.json({ error: "Missing external ID" }, { status: 400 });
  }

  const externalId = externalData.external_id;

  const { error: saveError } = await supabase
    .from("friendlylog_aws_connections")
    .insert({ role_arn: roleArn, external_id: externalId, user_id: userId });

  if (saveError) {
    return NextResponse.json({ error: "Failed to save connection" }, { status: 500 });
  }

  try {
    const groups = await getLogGroups(roleArn, externalId);
    return NextResponse.json({ success: true, groupNames: groups.groupNames, message: "Successfully connected to AWS" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch logs: ${err}` }, { status: 500 });
  }
}