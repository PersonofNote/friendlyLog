import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailySummaryEmail({
  to,
  date,
  totalRequests,
  errorRequests,
  totalChangePct,
  errorChangeCount,
}: {
  to: string;
  date: string;
  totalRequests: number;
  errorRequests: number;
  totalChangePct: string;
  errorChangeCount: number;
}) {
  await resend.emails.send({
    from: 'FriendlyLog <noreply@yourdomain.com>',
    to,
    subject: `Your FriendlyLog Summary for ${date}`,
    text: `
FriendlyLog Daily Summary for ${date}

• Total requests: ${totalRequests} (${totalChangePct === 'N/A' ? 'first day' : `${totalChangePct}% from yesterday`})
• Requests with errors: ${errorRequests} (${errorChangeCount >= 0 ? '+' : ''}${errorChangeCount} from yesterday)

—
Stay informed,
Your FriendlyLog
    `.trim(),
  });
}
