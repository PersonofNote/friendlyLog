'use client';

import { useState, useEffect } from 'react';

const ranges = [
  { label: 'Today', value: 'today' },
  { label: 'Last 1 Day', value: '1d' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
];

export default function RangePicker({ selectedRange, setSelectedRange, loading }: { selectedRange: string, setSelectedRange: (range: string) => void, loading: boolean, logs: any[] }) {

  return (
    <div className="p-4 rounded-lg border shadow-sm">
      <label className="block text-sm font-medium mb-2">Log Range</label>
      <select
        value={selectedRange}
        onChange={(e) => setSelectedRange(e.target.value)}
        className="border rounded px-3 py-2 mb-4"
      >
        {ranges.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

    </div>
  );
}
