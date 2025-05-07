import { createClient } from '@/utils/supabase/server'

export async function createProfileAndSettings(userId: string, tier: string) {
  const supabase = await createClient();

  // 1. Check if profile already exists
  const { data: existingProfile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (profileFetchError && profileFetchError.code !== 'PGRST116') { // Ignore "row not found"
    console.error('Error checking profile existence:', profileFetchError);
    return { error: profileFetchError.message };
  }

  // 2. If not found, insert into profiles
  if (!existingProfile) {
    const { error: profileInsertError } = await supabase
      .from('profiles')
      .insert({ id: userId, user_id: userId });

    if (profileInsertError) {
      console.error('Error inserting profile:', profileInsertError);
      return { error: profileInsertError.message };
    }
  }

  // 3. Check if settings already exist
  const { data: existingSettings, error: settingsFetchError } = await supabase
    .from('friendlyLog_user_settings')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (settingsFetchError && settingsFetchError.code !== 'PGRST116') { // Ignore "row not found"
    console.error('Error checking settings existence:', settingsFetchError);
    return { error: settingsFetchError.message };
  }

  // 4. If not found, insert into user settings
  if (!existingSettings) {
    const { error: settingsInsertError } = await supabase
      .from('friendlyLog_user_settings')
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

  return { success: true };
}
