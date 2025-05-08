'use client'

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Logs } from './components/Logs';
import { checkFirstLoginAndSetup } from './checkFirstLogin';

export default function Dashboard() {
  // #region States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState([]);
    const [selectedRange, setSelectedRange] = useState('1d');

  // #endregion

  const handleSignout = async() => {
    const signedOut = await fetch('/auth/signout', {
      method: 'POST',
    })
    // TODO: update to status 200 and implement timed interstital page with redirect and 302 status
    if (signedOut.status === 302) {
      redirect('/auth/login')
    }
}

  // #region UseEffects

  useEffect(() => {
    setLoading(true)
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/logs?range=${selectedRange}`)
        const data = await response.json()
        setLogs(data.logs)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching logs:', error)
        setError(error as string)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs();
  }, [selectedRange]);

  useEffect(() => {
    console.log(logs)
  }, [logs]);
  
  useEffect(() => {
    const checkUser = async () => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect('/auth/login');
      } else {
        // TODO: persist subscription tier
        const { isFirstLogin } = await checkFirstLoginAndSetup(3);
        // Check if user is onboarded
        if (isFirstLogin) {
          redirect("/onboarding");
        }
      }
    };
    checkUser();
  }, []);

  // #endregion

  // #region Constants

  // #endregion

  return (
   <div>
        {/* MAIN CONTENT */}
        <ul className="flex flex-wrap items-center text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
            <li className="me-2">
                <a href="#" aria-current="page" className="inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500">Profile</a>
            </li>
            <li className="me-2">
                <a href="#" onClick={handleSignout} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
                    </svg>
                    <span className="flex-1 ms-3 whitespace-nowrap">Sign Out</span>
                </a>
            </li>
        </ul>
        <main className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">    
            <Logs groups={logs} loading={loading} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
            {error && <p className="text-red-500">{error}</p>}
        </div>
        </main>
    </div> 
  )
}
