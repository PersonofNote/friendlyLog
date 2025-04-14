// pages/api/fetch-logs.ts

import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { roleArn, logGroupName } = req.body;

  if (!roleArn || !logGroupName) {
    return res.status(400).json({ error: "Missing required fields" });
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

    res.status(200).json({
      success: true,
      events: logs.events || [],
    });
  } catch (error) {
    console.error("AWS error:", error);
    res.status(500).json({ error: "Failed to assume role or fetch logs" });
  }
}
