'use client'

import { useEffect, useState } from 'react'
import { LogViewer } from './LogViewer';

export const Logs = ({ logs, loading, selectedRange, setSelectedRange }: { logs: any, loading: boolean, selectedRange: string, setSelectedRange: (range: string) => void }) => { 
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const ranges = [
        { label: 'Last 12 Hours', value: '12h' },
        { label: 'Today', value: 'today' },
        { label: 'Last 1 Day', value: '1d' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'All Time', value: 'all' },
      ];
      
    const toggleGroup = (name: string) => {
      setOpenGroups((prev) => ({
        ...prev,
        [name]: !prev[name],
      }));
    };
    const noLogs =  <div>
    <h2 className="text-xl font-semibold mb-2">Logs</h2>
    <p>No logs found</p>
</div>

       return loading ?  (<span className="loading loading-ring loading-xs"></span>)   
       : (<div className="mt-6">
             <select
        value={selectedRange}
        onChange={(e) => setSelectedRange(e.target.value)}
        className="border rounded px-3 py-2 mb-4"
      >
        {ranges.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
        <div className="space-y-4">
            {logs.length === 0 ? noLogs : null}
            {logs.map((group: any) => {
                const isOpen = openGroups[group.logGroupName] ?? true;
                return (
                <div key={group.logGroupName} className="p-4 border-b border-dashed border-gray-200">
                    <button
                        onClick={() => toggleGroup(group.logGroupName)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <h2 className="font-bold text-lg">{group.logGroupName}</h2>
                        <span className="text-sm text-blue-600">
                            {isOpen ? "Collapse" : "Expand"}
                        </span>
                    </button>
                    {isOpen && (
                        <LogViewer events={group.events} />
                    )}
                </div>
                    
                )}
            )} 
        </div>
    </div>
    )
};