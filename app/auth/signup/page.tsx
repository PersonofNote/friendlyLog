'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { signup } from './actions';
import './page.css';

// TODO GET FROM SERVER
const tierData = [{label: 'Free', value: 1}, {label: 'Pro', value: 2}, {label: 'Team', value: 3}]

const allowedTiers = ['free', 'pro', 'team'] as const;
type Tier = typeof allowedTiers[number];

function validateTier(tier: string | null): Tier {
  if (allowedTiers.includes((tier ?? 'free') as Tier)) {
    return (tier ?? 'free') as Tier;
  }
  return 'free';
}

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier');
  const tier: Tier = validateTier(tierParam);
  // TODO GET FROM SERVER
  const tierValue = tierData.find(t => t.label.toLowerCase() === tier?.toLowerCase())?.value;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace('/dashboard');
      }
    };
    checkUser();
  }, [supabase, router]);

  useEffect(() => {
    console.log(email)
  }, [email])

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signup(email, password, tierValue || 1);
      if (error) {
        console.log(error)
        setError(error);
      } else {
        // Todo make prettier
        setError('Check your email for a confirmation link')
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 w-1/2 mx-auto pt-20 h-screen">
      <form className="card items-center gap-4" onSubmit={handleSignup}>
        {tier && <div className="ribbon ribbon-top-left"><span>{tier}</span></div>}
        <h2 className="text-xl font-bold text-center">Sign up for FriendlyLog</h2>

        <div className="relative w-2/3">
          <input
            disabled={loading}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
          <label htmlFor="email" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Email</label>
        </div>

        <div className="relative w-2/3">
          <input
            disabled={loading}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
          <label htmlFor="password" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Password</label>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign up'}</button>
        <span className="text-sm">Already have an account? </span>
        <a href="/auth/login" className="btn btn-primary btn-outline">Log in</a>
      </form>
    </div>
  );
}
