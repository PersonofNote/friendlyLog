'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Link from 'next/link';

// IMPORTANT for NextJS error. Must wrap useSearchParams in Suspense
// see https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  )
}

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email');
  const type = searchParams.get('type');
  const confirmed = type === 'signup';

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (confirmed) {
        const loginUrl = email ? `/auth/login?email=${encodeURIComponent(email)}` : '/auth/login';
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
