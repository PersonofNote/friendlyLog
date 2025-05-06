import { createClient } from "@/utils/supabase/server";

export async function checkFirstLoginAndSetup(tier: number) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No user session found");
  }

  const userId = user.id;
  const userEmail = user.email;

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  // TODO: upsert based both existence and onboarded flag instead of just inserting
  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 is the error code for no rows found, which is expected in this case
    throw new Error(profileError.message);
  }

  const isFirstLogin = !existingProfile;

  if (isFirstLogin) {
    const { error: profileInsertError } = await supabase
      .from('profiles')
      .insert({ user_id: userId, services: ['friendlylog'], email: userEmail });
  
    if (profileInsertError) {
      console.error('Error inserting profile:', profileInsertError);
      return { error: profileInsertError.message };
    }
  

    const { data: existingSettings, error: settingsFetchError } = await supabase
      .from('friendlylog_user_settings')
      .select('user_id')
      .eq('user_id', userId)
      .single();
  
    if (settingsFetchError && settingsFetchError.code !== 'PGRST116') { // Ignore "row not found"
      console.error('Error checking settings existence:', settingsFetchError);
      return { error: settingsFetchError.message };
    }
  
    if (!existingSettings) {
      const { error: settingsInsertError } = await supabase
        .from('friendlylog_user_settings')
        .insert({
          user_id: userId,
          subscription_tier: tier,
          onboarded: false,
          created_at: new Date().toISOString(),
        });
  
      if (settingsInsertError) {
        console.error('Error inserting settings:', settingsInsertError);
        return { error: settingsInsertError.message };
      }
    }

    console.log("✅ User profile + settings created");
  }

  return { isFirstLogin };
}
