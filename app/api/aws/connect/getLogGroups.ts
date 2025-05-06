
import { CloudWatchLogsClient, DescribeLogGroupsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { withAssumedRole } from "../../helpers";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function getLogGroups(roleArn: string, externalId: string) {
  return withAssumedRole(roleArn, externalId, async (creds) => {
    const logsClient = new CloudWatchLogsClient({
      region: "us-east-1",
      credentials: creds,
    });

    const command = new DescribeLogGroupsCommand({});
    const response = await logsClient.send(command);
    console.log("Log groups:")
    console.log(response.logGroups)

    const groupNames = (response.logGroups || []).map((g) => g.logGroupName);
    return { groupNames };
  });
}


export async function saveLogGroups(groupNames: string[]) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const { error: updateError } = await supabase
  .from('friendlylog_user_settings')
  .upsert(
    {
      user_id: userId,
      tracked_logs_group: groupNames,
    },
    { onConflict: 'user_id' }
  );

if (updateError) {
  console.error("Failed to update tracked log groups:", updateError);
  return NextResponse.json({ error: "Failed to save selected log groups" }, { status: 500 });
}

}