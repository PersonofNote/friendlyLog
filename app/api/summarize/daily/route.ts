// File: /pages/api/cron/daily-summary.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import AWS from 'aws-sdk';
import { sendDailySummaryEmail } from '@/lib/sendEmail'; // assume you have this helper

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // need service role for inserting server-side
);

// AWS SDK client
const cloudwatchlogs = new AWS.CloudWatchLogs({
  region: 'us-east-1', // update if needed
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // 1. Define date range (yesterday)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const startTime = yesterday.getTime();
    const endTime = today.getTime();

    // 2. Query logs from AWS
    const logGroupName = '/aws/lambda/your-function'; // update as needed
    const queryString = `
      fields @timestamp, @message
      | stats count() as total_requests, countif(@message like /ERROR/) as error_requests
    `;

    const startQueryResp = await cloudwatchlogs.startQuery({
      logGroupName,
      startTime: Math.floor(startTime / 1000),
      endTime: Math.floor(endTime / 1000),
      queryString,
    }).promise();

    const queryId = startQueryResp.queryId!;

    // Wait for query to complete (polling)
    let results;
    while (true) {
      const queryResp = await cloudwatchlogs.getQueryResults({ queryId }).promise();
      if (queryResp.status === 'Complete') {
        results = queryResp.results;
        break;
      }
      await new Promise((r) => setTimeout(r, 1000)); // wait 1 sec before retrying
    }

    // 3. Extract counts
    const totalRequests = parseInt(results[0].find(f => f.field === 'total_requests')?.value || '0');
    const errorRequests = parseInt(results[0].find(f => f.field === 'error_requests')?.value || '0');

    // 4. Look up yesterday’s summary for comparison
    const { data: prevSummaries } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('date', yesterday.toISOString().slice(0, 10))
      .maybeSingle();

    const prevTotal = prevSummaries?.total_requests || 0;
    const prevErrors = prevSummaries?.error_requests || 0;

    const totalChangePct = prevTotal ? (((totalRequests - prevTotal) / prevTotal) * 100).toFixed(1) : 'N/A';
    const errorChangeCount = errorRequests - prevErrors;

    // 5. Save today’s summary
    await supabase.from('daily_summaries').insert([{
      user_id: 'some-user-id', // You'd loop per user in production
      date: yesterday.toISOString().slice(0, 10),
      total_requests: totalRequests,
      error_requests: errorRequests,
    }]);

    // 6. Send the summary email
    await sendDailySummaryEmail({
      to: 'user@example.com', // dynamically set per user in production
      date: yesterday.toISOString().slice(0, 10),
      totalRequests,
      errorRequests,
      totalChangePct,
      errorChangeCount,
    });

    res.status(200).json({ message: 'Summary saved and email sent.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process daily summary.' });
  }
}
