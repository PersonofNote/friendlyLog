import { NextRequest, NextResponse } from "next/server";
import { getLogs, getUserAwsData } from "../helpers";
import { subDays, subHours } from 'date-fns';

//TODO: Fix date range; rignt now "all time" has limits that mess up sorting. Implement pagination

export async function GET(req: NextRequest) {

  const  { roleArn, externalId, logGroups } = await getUserAwsData();
  
  if (!roleArn || !externalId || !logGroups) {
    return NextResponse.json({ error: "Missing AWS connection or log groups" }, { status: 400 });
  }
 
  const rangeParam = req.nextUrl.searchParams.get('range') || '1d';

  let startTime: number | undefined;

  const now = new Date();

  if (rangeParam === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startTime = startOfToday.getTime();
  } else if (rangeParam === '12h') {
    startTime = subHours(now, 12).getTime();
  } else if (rangeParam === '1d') {
    startTime = subDays(now, 1).getTime();
  } else if (rangeParam === '7d') {
    startTime = subDays(now, 7).getTime();
  } else if (rangeParam === '30d') {
    startTime = subDays(now, 30).getTime();
  } else if (rangeParam === 'all') {
    startTime = undefined;
  }

  try {
    const logs = await getLogs(roleArn, externalId, logGroups, startTime);
    
    return NextResponse.json({ success: true, logs });

  } catch (err) {
    
    return NextResponse.json({ error: `Failed to fetch logs: ${err}` }, { status: 500 });
  }
}
