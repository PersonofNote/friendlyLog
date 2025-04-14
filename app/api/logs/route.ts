
import { CloudWatchLogsClient, FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { NextRequest, NextResponse } from "next/server";

/* Mock data */
export async function GET() {
  const logs = [
    { timestamp: '2025-04-11T10:00:00Z', message: 'EC2 instance i-1234 restarted' },
    { timestamp: '2025-04-11T10:15:00Z', message: 'Lambda function timed out' },
    { timestamp: '2025-04-11T10:16:00Z', message: 'Lambda function invoked' },
    { timestamp: '2025-04-11T10:30:00Z', message: 'S3 storage nearing limit' },
  ];

  return new Response(
    JSON.stringify({ logs}),
    { headers: { 'Content-Type': 'application/json' } }
  );
}



export default async function handler(req: NextRequest, res: NextResponse) {
  const client = new CloudWatchLogsClient({
    region: "us-east-1", // replace with your region
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    const command = new FilterLogEventsCommand({
      logGroupName: "/aws/lambda/your-log-group", // replace with your log group
      limit: 50,
    });

    const response = await client.send(command);
    res.status(200).json(response.events || []);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
}
