import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { createClient } from "@/utils/supabase/server";
import { groupLogsByInvocation, getRequestsAndErrorsCount } from '@/app/dashboard/components/helpers';


type UserAwsDataResult = {  userId?: string, roleArn?: string, externalId?: string, logGroups?: string[], error?: string }


const sts = new STSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function withAssumedRole<T>(
  roleArn: string,
  externalId: string,
  callback: (creds: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  }) => Promise<T>
): Promise<T> {
  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: `FriendlyLog-session`,
    ExternalId: externalId,
    DurationSeconds: 900
  });

  const response = await sts.send(command);

  if (!response.Credentials) {
    throw new Error("Failed to assume role");
  }

  const tempCreds = {
    accessKeyId: response.Credentials.AccessKeyId!,
    secretAccessKey: response.Credentials.SecretAccessKey!,
    sessionToken: response.Credentials.SessionToken!,
  };

  return callback(tempCreds);
}

export const getLogs = async (roleArn: string, externalId: string, logGroups: string[], startTime?: number) => {
    
  const fetchedLogs = await withAssumedRole(roleArn, externalId, async (creds) => {
    const logsClient = new CloudWatchLogsClient({
      region: "us-east-1",
      credentials: creds,
    });

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
  return fetchedLogs;

};

export const getUserAwsData = async (): Promise<UserAwsDataResult> => {
  const supabase = await createClient();

  try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { error: "Unauthorized" };
      }

    const userId = user.id;
  
    const { data: awsData, error: awsError } = await supabase
      .from("friendlylog_aws_connections")
      .select("role_arn, external_id")
      .eq("user_id", userId)
      .single();
  
    if (awsError || !awsData?.role_arn || !awsData?.external_id) {
      return { error: "No AWS connection configured" };
    }
  
    const { data: settingsData, error: settingsError } = await supabase
      .from("friendlylog_user_settings")
      .select("tracked_log_groups")
      .eq("user_id", userId)
      .single();
  
    if (settingsError || !settingsData?.tracked_log_groups) {
      return { error: "No log groups configured" };
    }
  
    const { role_arn: roleArn, external_id: externalId } = awsData;
    const logGroups: string[] = settingsData.tracked_log_groups;

    return { userId, roleArn, externalId, logGroups };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { error: "Failed to fetch user data" };
  }
};

// eslint-disable-next-line
export async function saveSummary(userId: string, summary: any) {
  console.log("SAVING SUMMARY")
  console.log(summary)
  const supabase = await createClient();

  const { error } = await supabase.from('daily_summaries').insert([
    {
      user_id: userId,
      date: new Date(),
      summary: summary,
    },
  ]);

  if (error) {
    throw new Error(`Failed to save summary: ${error.message}`);
  }
};

export const getSummary = async(userId: string, date: Date) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('friendlylog_daily_summaries')
    .select('summary')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error) {
    console.error('Error fetching summary:', error);
    return null;
  }

  return data; 
};

export const compareSummaries = (today, yesterday) => {
    if (!today || !yesterday) {
      return {
        totalDiff: null,
        errorDiff: null
      };
    }
  
    const totalDiff = percentChange(today.totalRequests, yesterday.totalRequests);
    const errorDiff = percentChange(today.errorRequests, yesterday.errorRequests);
  
    return { totalDiff, errorDiff };
}
  
  function percentChange(todayValue, yesterdayValue) {
    if (yesterdayValue === 0) return todayValue === 0 ? 0 : 100;
    return ((todayValue - yesterdayValue) / yesterdayValue) * 100;
  }
  

// eslint-disable-next-line
export const processSummary = (userId: string, logs: any, yesterdaySummary?: any) => {
  console.log("PROCESSING SUMMARY")
  console.log(logs)
  // TODO: Implement comparison to yesterday's summary above
  const dashboardLink = '/';

  const totalLogs = logs.map(logGroup => logGroup.events).flat();
  const groupedLogs = groupLogsByInvocation(totalLogs);
  const { totalRequests, errorRequests, errorRate, healthCheck } = getRequestsAndErrorsCount(groupedLogs);


  saveSummary(userId, { style: 'mvp', totalRequests, errorRequests, healthCheck});

      /* TODO: potentially add individual log groups instead of just all of them
    const logSummaries = {}

    for (const logGroup of logs) {
      if (!logGroup.events || logGroup.events.length === 0) {
        logSummaries[logGroup.logGroupName] = { total_requests: 0, error_requests: 0 };
      } else {
        const groupedLogs = groupLogsByInvocation(logs.events);
        const results = getRequestsAndErrorsCount(groupedLogs);
        logSummaries[logGroup.logGroupName] = results;
      }
    }
    */

  const noLogs = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px;">

    ⚠️ There were no requests in the last 24 hours. If this is unexpected, please check your log groups and ensure they are correctly configured.

    <p>
      🔎 <a href="" style="color: #4CAF50; text-decoration: none; font-weight: bold;">
        View full logs & details
      </a>
    </p>

    <p style="margin-top: 30px">
      Thanks for using FriendlyLog — keeping your AWS chaos under control.<br>
      - The FriendlyLog Team
    </p>
  </div>
  `;

  const logStats = `  
    <ul style="list-style: none; padding: 0;">
      <li>🚀 <strong>Total Requests: </strong>${totalRequests}</li>
      <li>❌ <strong>Total Errors:</strong> ${errorRequests}</li>
      <li>⚠️ <strong>Error Rate:</strong> ${errorRate * 100}%
      <li>✅ <strong>Health Check:</strong> ${healthCheck}</li>
    </ul>`;

          /* TODO: implement later
    const topErrors = `<h3 style="color: #4CAF50;">Top Errors Today:</h3>
    <ol>
      <li><code>DatabaseTimeoutError</code> — 152 occurrences</li>
      <li><code>AuthTokenInvalid</code> — 98 occurrences</li>
      <li><code>PaymentFailedError</code> — 47 occurrences</li>
    </ol>`;
    */

    const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px;">
      <h2 style="color: #4CAF50;">Today's Summary</h2>

      ${totalLogs.length < 1 ? noLogs : logStats}

      <p>
        🔎 <a href="${dashboardLink}">
          <strong>View full logs & details</strong>
        </a>
      </p>
  
      <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
        Thanks for using FriendlyLog — keeping your AWS chaos under control.<br>
        - The FriendlyLog Team
      </p>
    </div>
  `;

  return html
};
