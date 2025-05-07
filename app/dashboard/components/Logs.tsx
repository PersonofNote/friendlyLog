'use client'

import { useEffect, useState } from 'react'
import { LogViewer } from './LogViewer';
import { noLogs } from './noLogs';

export const Logs = ({ groups, loading, selectedRange, setSelectedRange }: { groups: any, loading: boolean, selectedRange: string, setSelectedRange: (range: string) => void }) => { 
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

   

       return   (
       <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
            <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="select select-sm"
            >
                {ranges.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
                ))}
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="btn btn-xs btn-ghost">
            {sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
            </button>
        </div>
        <div className="space-y-4">
            {groups.length === 0 ? loading ? (<span className="loading loading-ring loading-xs"></span>) : noLogs : null}
            {groups.map((group: any) => {
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
                        <LogViewer events={group.events} sortOrder={sortOrder} loading={loading} />
                    )}
                </div>
                    
                )}
            )} 
        </div>
    </div>
    )
};