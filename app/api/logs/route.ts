import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { withAssumedRole } from "../helpers";
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

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

  let startTime: number;

  switch (rangeParam) {
    case 'today':
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);
      startTime = startOfToday.getTime();
      break;
    case '7d':
      startTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // last 7 days
      break;
    case '1d':
    default:
      startTime = Date.now() - 24 * 60 * 60 * 1000; // last 1 day
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
          startTime
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
