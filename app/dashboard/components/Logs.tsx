
/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: save timeframe to localstorage so it doesn't reset on refresh
'use client'

import { useState } from 'react'
import { LogViewer } from './LogViewer';
import { noLogs } from './noLogs';
import { SummaryCard } from './SummaryCard';
import { groupLogsByInvocation } from './helpers';

export const Logs = ({ groups, loading, selectedRange, setSelectedRange }: { groups: any, loading: boolean, selectedRange: string, setSelectedRange: (range: string) => void }) => { 

    const TIMEFRAME_KEY = 'friendlylog-timeframe';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRange(e.target.value)
        const value = e.target.value;
        localStorage.setItem(TIMEFRAME_KEY, value);
      };
        
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
            {loading ? (<div className="skeleton h-4 w-1/2"></div>) : (
                <>
                    <select
                    value={selectedRange}
                    onChange={(e) => handleChange(e)}
                    className="select select-sm"
                    >
                        {ranges.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                    <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="btn btn-xs btn-ghost">
                    {sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                    </button>
                </>)}
            </div>
        <div className="space-y-4">
            {groups.length === 0 ? loading ? (
                <div className="flex w-full flex-col gap-4">
                <div className="skeleton h-32 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                </div>
                ) : noLogs : null}
            {groups.map((group: any) => {
                const isOpen = openGroups[group.logGroupName] ?? true;
                const invocations = groupLogsByInvocation(group.events);
                return (
                <div key={group.logGroupName} className="lg:p-4 border-b border-dashed border-gray-200">
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
                        <>
                            <SummaryCard logs={invocations} />
                            <LogViewer invocations={invocations} sortOrder={sortOrder} loading={loading} />
                        </>
                    )}
                </div>
                    
                )}
            )} 
        </div>
    </div>
    )
};