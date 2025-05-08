import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import { getLogs, getUserAwsData } from '../../helpers';
import { groupLogsByInvocation, getRequestsAndErrorsCount } from '@/app/dashboard/components/helpers';

const dashboardLink = "https://friendlylog.dev/dashboard";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log("POST /api/summarize/daily");
    if (req.method !== 'POST') return NextResponse.json({ status: 405, message: 'Method not allowed' });

    const  { roleArn, externalId, logGroups } = await getUserAwsData();
    
    if (!roleArn || !externalId || !logGroups) {
      return NextResponse.json({ error: "Missing AWS connection or log groups" }, { status: 400 });
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const startTime = yesterday.getTime();
    

    const logs = await getLogs(roleArn, externalId, logGroups, startTime);
  

    if (!logs || logs.length === 0) {
      return NextResponse.json({ error: "No logs found" }, { status: 404 });
    }

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
    const date = new Date().toLocaleDateString();
    const totalLogs = logs.map(logGroup => logGroup.events).flat();
    const groupedLogs = groupLogsByInvocation(totalLogs);
    const { totalRequests, errorRequests, errorRate, healthCheck } = getRequestsAndErrorsCount(groupedLogs);

    const noLogs = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px;">
      <h2 style="color: #4CAF50;">📊 FriendlyLog Daily Summary ${date}</h2>
  
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
      <h2 style="color: #4CAF50;">📊 Today's Summary</h2>

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

  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['habelexmail@gmail.com'],
      subject: `📊 FriendlyLog Daily Summary — ${date}`,
      html: html,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}