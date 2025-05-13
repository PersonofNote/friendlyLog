import { NextResponse } from 'next/server';
import { createClient } from '@/utiles/supabase/server';
import { getSummary, getLogs, getUserAwsData, processSummary } from '../helpers';     
import { Resend } from 'resend'; 
import { User } from '@supabase/supabase-js';

const BATCH_SIZE = 5;
const WAIT_BETWEEN_BATCHES_MS = 200;

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (html: string, date: Date) => {
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
};

export async function GET() {
  const supabase = await createClient();

  // TODO: query profiles table and fetch email column where friendlylog is in services

  // 1. Get active users
  const { data: users, error } = await supabase
    .from('friendlylog_user_settings')
    .select('*')
    //.eq('summary_enabled', true); // TODO: find actual schema. This gonna get kinda ugly
    

  if (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }

  // 2. Process in batches
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (user: User) => { //Todo: Update type to reflect user fetched from profiles table instead of supabase auth
        if (!user) {
            console.log("User not found")
        }
        try {
          const yesterday = new Date();
          yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        
          const startTime = yesterday.getTime();

          const { userId, roleArn, externalId, logGroups } =  await getUserAwsData(user.id);

          if (!userId || !roleArn || !externalId || !logGroups) {
            console.error("Missing")
            return;
          }
          
          const summary = await getSummary(userId, yesterday);

          const logs = getLogs(roleArn, externalId, logGroups, startTime)

          processSummary(userId, logs, summary);

          await sendEmail(user.email, summary);

          console.log(`Processed user ${user.email}`);
        } catch (err) {
          console.error(`Failed for user ${user.email}:`, err);
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
