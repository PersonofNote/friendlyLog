import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import { getLogs, getUserAwsData, unwrapResult, processSummary } from '../../helpers';



const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log("POST /api/summarize/daily");
    if (req.method !== 'POST') return NextResponse.json({ status: 405, message: 'Method not allowed' });

    const  { userId, roleArn, externalId, logGroups } = await getUserAwsData();
    
    // Do I still need this with the unwrap result call?
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
  
    // TODO: Implement comparison to yesterday
    const html = processSummary(userId, logs);
    const date = new Date().toLocaleDateString();


    try {
      const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: user.email],
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