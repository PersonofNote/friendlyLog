'use client'

import { useEffect, useState } from 'react'

export const Logs = ({ user }) => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchLogs = async () => {
        try {
            const response = await fetch('/api/logs')
            const data = await response.json()
            console.log(data)
            setLogs(data.logs)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching logs:', error)
            setError('Failed to fetch logs')
        }
    }

    useEffect(() => {
        fetchLogs();
    }, [])

    useEffect(() => {
        console.log("LOGS")
        console.log(logs)
    }, [logs])

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Logs</h2>
            {loading ? (
                <p>Fetching logs...</p>
            ) : (
                <ul className="list bg-base-100 rounded-box shadow-md">

                    <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Last refreshed at: </li>
                    {logs && logs.length > 0 && logs.map(log => (
                        <li className="list-row">
                            <div>💥</div>
                            <div>
                                <div>{log.message}</div>
                                <div className="text-xs uppercase font-semibold opacity-60">{log.timestamp}</div>
                            </div>
                            <button className="btn btn-square btn-ghost">
                                <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                            </button>
                            <button className="btn btn-square btn-ghost">
                                <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
};