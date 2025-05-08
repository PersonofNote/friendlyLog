import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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
    DurationSeconds: 900, // 15 min
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

export const getUserAwsData = async () => {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
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

    return { roleArn, externalId, logGroups };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { error: "Failed to fetch user data" };
  }
};
