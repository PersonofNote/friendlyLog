  'use server';

import { createClient } from '@/utils/supabase/server'
//todo look into how supabase stores passwords
export async function confirmSignup() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return { error: userError.message };
  }

  const userId = user?.id;

  
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        user_id: userId,
        created_at: new Date().toISOString(),
        email: email
      },
    ]);

  console.log("profileError", profileError);

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: settingsError } = await supabase
    .from('friendlylog_user_settings')
    .insert([
      {
        user_id: userId,
        created_at: new Date().toISOString(),
        subscription_tier: tier,
        onboarded: false
      },
    ]);

  console.log("settingsError", settingsError);

  if (settingsError) {
    return { error: settingsError.message };
  }

  return { success: true, message: 'Successfully signed up - check your email for a confirmation link' }
}