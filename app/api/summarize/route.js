async function mockLambdaSummarizer(logs) {
  const summary = `Summary of ${logs.length} logs: \n` + logs
    .map((log) => `- ${log.message} at ${log.timestamp}`)
    .join("\n");

  return summary;
}

export async function GET() {
  const logs = [
    { timestamp: '2025-04-11T10:00:00Z', message: 'EC2 instance i-1234 restarted' },
    { timestamp: '2025-04-11T10:15:00Z', message: 'Lambda function timed out' },
    { timestamp: '2025-04-11T10:16:00Z', message: 'Lambda function invoked' },
    { timestamp: '2025-04-11T10:30:00Z', message: 'S3 storage nearing limit' },
  ];

  const summary = await mockLambdaSummarizer(logs);

  return new Response(
    JSON.stringify({ summary }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
