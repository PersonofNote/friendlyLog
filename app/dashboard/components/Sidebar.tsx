"use client";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { Settings, ChevronDown, ChevronLeft, Menu } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export const Sidebar = ({user} : {user?: User} ) => {
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const [emailsEnabled, setEmailsEnabled] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
  
    const handleToggle = () => {
        console.log("Toggle clicked");
      setEmailsEnabled(!emailsEnabled);
      setShowPopup(true);
  
      setTimeout(() => {
        setShowPopup(false);
      }, 2000);
    };

    const handleSignout = async() => {
        const signedOut = await fetch('/auth/signout', {
          method: 'POST',
        })
        // TODO: update to status 200 and implement timed interstital page with redirect and 302 status
        if (signedOut.status === 302) {
          redirect('/auth/login')
        }
    }

    useEffect(() => {
        // TODO: Move to api route
        const updateSummarySetting = async () => {
            const supabase = createClient();
            const { data, error: settingsFetchError } = await supabase
                .from('friendlylog_user_settings')
                .upsert(
                    {
                      user_id: user?.id,
                      summaries_enabled: emailsEnabled,
                    },
                    { onConflict: 'user_id' }
                  );
            if (settingsFetchError) {
                console.error('Error checking settings existence:', settingsFetchError);
                return;
            }
            console.log("Updated settings:", data);
        }
        updateSummarySetting();
    },[emailsEnabled])

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        // TODO: Move to api route
        const getUserSettings = async () => {
                const supabase = createClient();
                const { data: existingSettings, error: settingsFetchError } = await supabase
                    .from('friendlylog_user_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                if (settingsFetchError) {
                    console.error('Error checking settings existence:', settingsFetchError);
                    return;
                }
                if (existingSettings) {
                    setEmailsEnabled(existingSettings.summaries_enabled);
                }
        }
        getUserSettings();
        setLoading(false);
        },[user]);

return (
    <>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} data-drawer-target="settings-menu" data-drawer-toggle="settings-menu" aria-controls="settings-menu" type="button" className="btn btn-ghost btn-square p-2 mt-2 ms-3 text-sm text-base-500 rounded-lg md:hidden hover:bg-base-100 focus:outline-none focus:ring-2">
        <span className="sr-only">Open sidebar</span>
            <Menu className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"/>
        </button>

        <aside id="settings-menu" className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0`} aria-label="Settings Menu">
            <div className="h-full px-3 py-4 overflow-y-auto bg-base-100">
                {loading ?(
                    <div className="flex w-full flex-col gap-4">
                        <div className="skeleton h-32 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                    </div>):(
                <ul className="space-y-2 font-medium flex flex-col">
                    <button onClick={() => setSidebarOpen(false)} data-drawer-target="settings-menu" data-drawer-toggle="settings-menu" aria-controls="settings-menu" type="button" className="flex items-center self-end p-2 pt-0 ms-3 text-sm text-base-500 rounded-lg md:hidden hover:bg-base-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
                        <ChevronLeft className="w-6 h-6" aria-hidden="true" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"/> <span>Close</span>
                     </button>
                    <li className="border-base-200 border-t">
                        <button onClick={() => setSettingsOpen(!settingsOpen)} type="button" className="flex items-center w-full p-2 mb-2 text-base text-content transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="user-settings" data-collapse-toggle="user-settings">
                            <Settings />
                            <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">Settings</span>
                            <ChevronDown className={`w-6 h-6 ${settingsOpen ? 'rotate-180' : 'rotate-0'} transition-all duration-200`} aria-hidden="true" />
                        </button>
                        <ul id="user-settings" className={`${settingsOpen ? 'opacity-100 h-16' : 'opacity-0 h-0'} pl-2 transition-all duration-300 ease-in-out flex flex-col gap-4`}>
                            <li>
                                <label className="text-content">
                                    <input type="checkbox" onChange={handleToggle} disabled={showPopup} checked={emailsEnabled} className="toggle" />
                                    <span className="pl-2">📧 Daily emails</span>
                                </label>
                                {showPopup && (
                                <div className="absolute left-0 mt-2 w-max alert alert-success text-success-content shadow-lg rounded p-2 text-sm text-gray-800 z-50">
                                    {emailsEnabled ? 'You will now receive daily emails!' : 'You have turned off daily emails!'}
                                </div>
                                )}
                            </li>
                            <li>
                                <div className="indicator flex flex-row no-wrap">
                                    <span className="badge badge-accent indicator-item text-xs"> Coming soon </span>
                                    <div className="text-small text-content opacity-50"> Configure Log Groups</div>                  
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li className="mt-4 border-t border-base-200">
                        <a href="#" onClick={handleSignout} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
                        </svg>
                        <span className="flex-1 ms-3 whitespace-nowrap">Sign Out</span>
                        </a>
                    </li>
                </ul>
            )}
            </div>
        </aside>
    </>
    )
}