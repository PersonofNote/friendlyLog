'use client'

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Logs } from './components/Logs';
import { checkFirstLoginAndSetup } from './checkFirstLogin';
import { Sidebar } from './components/Sidebar';
import { User } from '@supabase/supabase-js';


const TIMEFRAME_KEY = 'friendlylog-timeframe';

export default function Dashboard() {
  // #region States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState([]);
    const [selectedRange, setSelectedRange] = useState('1d');
    const [user, setUser] = useState<User | null>(null);

    // Load saved timeframe on mount
      useEffect(() => {
        const saved = localStorage.getItem(TIMEFRAME_KEY);
        if (saved) {
            setSelectedRange(saved);
        } else {
          setSelectedRange('1d');
        }
    }, []);

  // #endregion

  // #region UseEffects

  useEffect(() => {
    setLoading(true);
    if (!selectedRange) return;
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
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user)
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
   <div style={{ minHeight: '100vh' }} className="flex flex-col lg:flex-row">
      {user && (
        <>
          <Sidebar user={user} /> 
          <main className="p-4 grow">
          <div className="lg:p-4 lg:border-2 lg:border-gray-200 lg:border-dashed rounded-lg dark:border-gray-700 max-w-4xl mx-auto">    
              <Logs groups={logs} loading={loading} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
              {error && <p className="text-error">{error}</p>}
          </div>
          </main>
        </>
      )}
    </div> 
  )
}
