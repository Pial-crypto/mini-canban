'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  // const { user, loading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (loading) return;
  //   router.replace(user ? '/boards' : '/login');
  // }, [user, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center text-slate-500">
      Loading&hellip;
    </div>
  );
}
