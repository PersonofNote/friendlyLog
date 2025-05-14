import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSummary, getLogs, processSummary } from '../helpers';     
import { Resend } from 'resend'; 
import { FriendlyLogUser } from '@/utils/types';

const BATCH_SIZE = 5;
const WAIT_BETWEEN_BATCHES_MS = 200;

const resend = new Resend(process.env.RESEND_API_KEY);

const senderEmail = 'FriendlyLog <noreply@habelex.com>'

const sendEmail = async (email: string, html: string, date: Date) => {
    try {
        const { data, error } = await resend.emails.send({
          from: senderEmail,
          to: email,
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
};

export async function GET() {
  
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables");
}
 const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: users, error } = await supabase
    .from('friendlylog_user_settings')
    .select('*')
    .eq('summaries_enabled', true);

  if (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }

  // Batch processing
  for (let i = 0; i < users.length; i += BATCH_SIZE) {

    const batch = users.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (user: FriendlyLogUser ) => {
        if (!user) {
            console.log("User not found")
        }
        try {
          const now = new Date();
          
          const yester = new Date(now.getDate() - 1);
          const yesterday = yester.toISOString().split("T")[0];
          
          const todayMidnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0, 0, 0, 0
          );

          const userId = user.user_id;
          console.log(user.user_id);

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

          if (!userId || !roleArn || !externalId || !logGroups) {
            console.error("Missing user data")
            return;
          }

          const { data: email, error: emailError } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", userId)
          .single();

          if (emailError || !email) {
            console.error("Missing email")
            return;
          };
          
          const yesterdaySummary = await getSummary(userId, yesterday as unknown as Date);

          const logs = await getLogs(roleArn, externalId, logGroups, todayMidnight.getTime())

          const summaryHtml = await processSummary(userId, logs, yesterdaySummary);

          try {
            const { data, error } = await resend.emails.send({
              from: senderEmail,
              to: email.email,
              subject: `📊 FriendlyLog Daily Summary — ${new Date()}`,
              html: summaryHtml,
            });
            console.log("Email sent to", email.email);
            if (error) {
              return Response.json({ error }, { status: 500 });
            }
        
            return Response.json(data);
          } catch (error) {
            return Response.json({ error }, { status: 500 });
          }

        } catch (err) {
          console.error(`Failed for user ${user}:`, err);
        }
      })
    );

    // Avoid rate limit
    await wait(WAIT_BETWEEN_BATCHES_MS);
  }

  return NextResponse.json({ success: true });
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
