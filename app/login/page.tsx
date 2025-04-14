import { login, signup } from './actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';


export default async function LoginPage() {
    const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard')
  }
  
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
    </form>
  )
}