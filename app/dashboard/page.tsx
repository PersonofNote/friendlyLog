'use client'

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SummaryCard } from './components/SummaryCard';
import { Logs } from './components/Logs';
import { checkFirstLoginAndSetup } from './checkFirstLogin';

export default function Dashboard() {
  // #region States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState([]);
    const [user, setUser] = useState(null);
    const [selectedRange, setSelectedRange] = useState('1d');

  // #endregion

  // #region UseEffects

  useEffect(() => {
    setLoading(true)
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/logs?range=${selectedRange}`)
        const data = await response.json()
        console.log(data)
        setLogs(data.logs)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching logs:', error)
        setError('Failed to fetch logs')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs();
  }, [user, selectedRange])
  
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
        }else {
            setUser(user);
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
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
            <li className="me-2">
                <a href="#" aria-current="page" className="inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500">Profile</a>
            </li>
            <li className="me-2">
                <a href="#" className="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300">Dashboard</a>
            </li>
            <li className="me-2">
                <a href="#" className="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300">Settings</a>
            </li>
            <li className="me-2">
                <a href="#" className="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300">Contacts</a>
            </li>
            <li>
                <a className="inline-block p-4 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500">Disabled</a>
            </li>
        </ul>
        <main className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">    
            <SummaryCard user={user} />
            <Logs logs={logs} loading={loading} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
        </div>
        </main>
    </div> 
  )
}
