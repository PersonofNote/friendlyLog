import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

type AssumeRoleResponse = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

// Step 1: Assume the user’s role
export async function assumeUserRole(roleArn: string, externalId: string): Promise<AssumeRoleResponse> {
  const sts = new STSClient({ region: "us-east-1" });

  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: `FriendlyLog-test`,
    ExternalId: externalId,
    DurationSeconds: 900,
  });

  const response = await sts.send(command);
  const creds = response.Credentials;

  if (!creds) throw new Error("Could not get credentials");

  return {
    accessKeyId: creds.AccessKeyId!,
    secretAccessKey: creds.SecretAccessKey!,
    sessionToken: creds.SessionToken!,
  };
}

// Step 2: Use those credentials to fetch logs
export async function getRecentLogs(roleArn: string, externalId: string) {
  const creds = await assumeUserRole(roleArn, externalId);

  const client = new CloudWatchLogsClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
    },
  });

  // Optional: list log groups to verify access
  const logGroups = await client.send(new DescribeLogGroupsCommand({ limit: 5 }));

  // Optional: fetch actual log events
  const firstGroup = logGroups.logGroups?.[0];
  if (!firstGroup?.logGroupName) {
    throw new Error("No log groups found");
  }

  const logs = await client.send(
    new FilterLogEventsCommand({
      logGroupName: firstGroup.logGroupName,
      limit: 10,
      startTime: Date.now() - 1000 * 60 * 10, // last 10 minutes
    })
  );

  return {
    group: firstGroup.logGroupName,
    events: logs.events ?? [],
  };
}
