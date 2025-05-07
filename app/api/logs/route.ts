import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { withAssumedRole } from "../helpers";
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { parseISO, subDays, subHours } from 'date-fns';

//TODO: Fix date range; rignt now "all time" has limits that mess up sorting. Implement pagination

export async function GET(req: NextRequest) {
  console.log("🔄 Route hit");
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

    console.log("AWS DATA")
    console.log(awsData)

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


  // date range 
  const rangeParam = req.nextUrl.searchParams.get('range') || '1d'; // default to last ay

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
    startTime = undefined; // No filtering
  }

  try {
    const logs = await withAssumedRole(roleArn, externalId, async (creds) => {
      const logsClient = new CloudWatchLogsClient({
        region: "us-east-1",
        credentials: creds,
      });

      // Fetch logs from all saved log groups in parallel
      const logFetches = logGroups.map(async (logGroupName) => {
        const cmd = new FilterLogEventsCommand({
          logGroupName,
          ...(startTime ? { startTime } : {}), // Only add startTime if defined
          limit: 1000
        });

        const response = await logsClient.send(cmd);

        return {
          logGroupName,
          events: response.events || [],
        };
      });

      const results = await Promise.all(logFetches);

      return results;
    });

    console.log("🪵 Logs fetched:", logs);
    return NextResponse.json({ success: true, logs });

  } catch (err: any) {
    console.error("❌ Log fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
