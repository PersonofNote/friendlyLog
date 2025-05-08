import { EmailTemplate } from '../../../components/EmailTemplate';
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import { getLogs, getUserAwsData } from '../../helpers';
import { groupLogsByInvocation, getRequestsAndErrorsCount } from '@/app/dashboard/components/helpers';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest, res: NextResponse) {
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
    const endTime = today.getTime();
    

    const logs = await getLogs(roleArn, externalId, logGroups, startTime);
    console.log("LOGS", logs);

    if (!logs || logs.length === 0) {
      return NextResponse.json({ error: "No logs found" }, { status: 404 });
    }

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

    /* 
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
      */

  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['habelexmail@gmail.com'],
      subject: 'Hello world',
      react: EmailTemplate({ logSummaries }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}