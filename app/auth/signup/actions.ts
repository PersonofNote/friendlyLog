'use server';

import { createClient } from '@/utils/supabase/server'
//todo look into how supabase stores passwords
export async function signup(email: string, password: string) {
  const supabase = await createClient()

  console.log("Signing up with: ", email, password)

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {},
  });
  

  console.log("signUpError", signUpError)

 
  if (signUpError) {
    return { error: signUpError.message };
  }

  return { success: true, message: 'Successfully signed up - check your email for a confirmation link' }
}