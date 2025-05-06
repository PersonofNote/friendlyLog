import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";


export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { selectedLogGroups } = await req.json();

  if (!Array.isArray(selectedLogGroups) || selectedLogGroups.length === 0) {
    return NextResponse.json({ error: "No log groups selected" }, { status: 400 });
  }

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
        tracked_log_groups: selectedLogGroups,
      },
      { onConflict: 'user_id' }
    );

  if (updateError) {
    console.error("Failed to update tracked log groups:", updateError);
    return NextResponse.json({ error: "Failed to save selected log groups" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Log groups saved" });
}


export async function GET(req: NextRequest) {
    const supabase = await createClient();
  
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const userId = user.id;
  
    try {
  
      const { data: trackedLogGroups, error: fetchError } = await supabase
        .from("friendlylog_user_settings")
        .select("tracked_log_groups")
        .eq("user_id", userId);
  
      if (fetchError) {
        throw fetchError;
      }
  
      return NextResponse.json({ success: true, data: trackedLogGroups }, { status: 200 });
    } catch (err: any) {
      console.error("Failed to fetch selected log groups:", err);
      return NextResponse.json(
        { error: "Could not fetch selected log groups" },
        { status: 403 }
      );
    }
  }
