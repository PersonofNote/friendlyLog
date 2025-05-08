import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getLogs } from "../helpers";
import { subDays, subHours } from 'date-fns';

//TODO: Fix date range; rignt now "all time" has limits that mess up sorting. Implement pagination

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const { data: awsData, error: awsError } = await supabase
    .from("friendlylog_aws_connections")
    .select("role_arn, external_id")
    .eq("user_id", userId)
    .single();

  if (awsError || !awsData?.role_arn || !awsData?.external_id) {
    return NextResponse.json({ error: "Missing AWS connection" }, { status: 400 });
  }

  const { data: settingsData, error: settingsError } = await supabase
    .from("friendlylog_user_settings")
    .select("tracked_log_groups")
    .eq("user_id", userId)
    .single();

  if (settingsError || !settingsData?.tracked_log_groups) {
    return NextResponse.json({ error: "No log groups configured" }, { status: 400 });
  }

  const { role_arn: roleArn, external_id: externalId } = awsData;
  const logGroups: string[] = settingsData.tracked_log_groups;


  const rangeParam = req.nextUrl.searchParams.get('range') || '1d';

  let startTime: number | undefined;

  const now = new Date();

  if (rangeParam === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startTime = startOfToday.getTime();
  } else if (rangeParam === '12h') {
    startTime = subHours(now, 12).getTime();
  } else if (rangeParam === '1d') {
    startTime = subDays(now, 1).getTime();
  } else if (rangeParam === '7d') {
    startTime = subDays(now, 7).getTime();
  } else if (rangeParam === '30d') {
    startTime = subDays(now, 30).getTime();
  } else if (rangeParam === 'all') {
    startTime = undefined;
  }

  try {
   
    const logs = await getLogs(roleArn, externalId, logGroups, startTime);
    
    return NextResponse.json({ success: true, logs });

  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch logs: ${err}` }, { status: 500 });
  }
}
