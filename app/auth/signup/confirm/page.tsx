'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [confirmed, setConfirmed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const type = searchParams.get('type');
    if (type === 'signup') {
      setConfirmed(true);
    }

    if (emailParam) {
      setEmail(emailParam);
    }

    const timeout = setTimeout(() => {
      if (confirmed) {
        const loginUrl = emailParam ? `/auth/login?email=${encodeURIComponent(emailParam)}` : '/auth/login';
        router.push(loginUrl);
      }
    }, 5000);

    return () => clearTimeout(timeout);

  }, [searchParams, confirmed, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      {confirmed ? (
        <>
          <h1 className="text-2xl font-bold mb-4">✅ Your email has been confirmed!</h1>
          <p className="mb-6">You can now log in to your account.</p>
          <Link href={email ? `/auth/login?email=${encodeURIComponent(email)}` : '/auth/login'} className="btn btn-accent">
            Log In
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">👋 Welcome back</h1>
          <p>Please log in to continue.</p>
          <Link href="/auth/login" className="mt-4 btn btn-accent">
            Log In
          </Link>
        </>
      )}
    </div>
  );
}
