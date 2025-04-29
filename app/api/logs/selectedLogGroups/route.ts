import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { selectedLogGroups } = await req.json();

  if (!selectedLogGroups) {
    return NextResponse.json({ error: "Missing selected log groups" }, { status: 400 });
  }

  // Get Supabase session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  try {

    const { error: saveError } = await supabase
      .from("friendlylog")
      .eq("user_id", userId)
      .update({ selected_log_groups: selectedLogGroups });

    if (saveError) {
      throw saveError;
    }

    return NextResponse.json({ success: true, message: "Saved selected log groups" }, { status: 200 });
  } catch (err: any) {
    console.error("Failed to save selected log groups:", err);
    return NextResponse.json(
      { error: "Could not save selected log groups" },
      { status: 403 }
    );
  }
}


export async function GET(req: NextRequest) {
    const supabase = await createClient();
  
    // Get Supabase session
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const userId = user.id;
  
    try {
  
      const { data: { selectedLogGroups }, error: fetchError } = await supabase
        .from("friendlylog")
        .eq("user_id", userId)
        .select("selected_log_groups");
  
      if (fetchError) {
        throw fetchError;
      }
  
      return NextResponse.json({ success: true, data: selectedLogGroups }, { status: 200 });
    } catch (err: any) {
      console.error("Failed to fetch selected log groups:", err);
      return NextResponse.json(
        { error: "Could not fetch selected log groups" },
        { status: 403 }
      );
    }
  }
