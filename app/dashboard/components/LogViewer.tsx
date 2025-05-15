/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Fix filtering
import { useState, useEffect } from "react";
import { StatusTag } from "./StatusTag";
import { ChevronDown, ChevronUp, Funnel, Timer, ThermometerSnowflake } from "lucide-react";
import { noLogs } from "./noLogs";

export function LogViewer({ invocations, sortOrder, loading }: { invocations: any[], sortOrder: 'asc' | 'desc', loading: boolean }) {
  
  const [filter, setFilter] = useState<string[]>([]);

  const [sortedLogs, setSortedLogs] = useState<any[]>(invocations);
        
  const sortLogs = () => {
    const sorted = invocations.sort((a: any, b: any) => {
        const aTime = a.startTime
        const bTime = b.startTime
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });
    setSortedLogs(sorted);
};

const toggleFilter = (filter: string) => {
  setFilter((prev) =>
    prev.includes(filter)
      ? prev.filter((f) => f !== filter)
      : [...prev, filter]
  );
};

  const filteredLogs = filter.length > 0
  ? sortedLogs.filter((invocation: any) =>
      invocation.filters?.some((f: string) => filter.includes(f))
    )
  : sortedLogs;

  useEffect(() => {
    sortLogs();
  }, [invocations, sortOrder]);


  return loading ?  (<span className="loading loading-ring loading-xs"></span>)   : (
    <div>
        {filter.length !== 0 && <div className="flex items-center gap-2 py-2">
          <Funnel className="w-4 h-4" aria-label="Filter" />| 
          {filter.map((f, i) => <StatusTag key={`filter-${f}-${i}`} status={f} onClick={(f) => toggleFilter(f)} aria-label={`Clear filter ${f}`}/>)
          }
      </div>
          }
      {filteredLogs.length === 0 ? noLogs : filteredLogs.map((invocation, idx) => (
        <InvocationBlock key={idx} invocation={invocation} toggleFilter={toggleFilter} />
      ))}
    </div>
  );
}

function InvocationBlock({ invocation, toggleFilter }: { invocation: any, toggleFilter: (filter: string) => void }) {
  const [open, setOpen] = useState(false);

  const logTime = new Date(invocation.startTime).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  return (
    <div
      className={`border rounded p-2 my-2 ${
         invocation.hasError || invocation.status === "error" || invocation.status === "fail" || invocation.status === "failed" || invocation.status === "errordetails" ? "border-error" : "border-base-300"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-row flex-wrap items-center">
          <span className="text-sm font-mono lg:w-40 inline-block">{logTime}</span>
          <div className="flex items-center gap-2 flex-grow">
          {invocation.status && (
            <StatusTag status={invocation.status} onClick={(status) => toggleFilter(status)} aria-label="Status" />
          )}
          {invocation.durationMs && (
            <span className="ml-2 text-sm text-content flex gap-1 items-center">
              <Timer className="w-4 h-4" aria-label="Duration" /> {invocation.durationMs} ms
            </span>
          )}
          {invocation.coldStart && (
                <StatusTag status={'coldstart'} onClick={(status) => toggleFilter('coldstart')} aria-label="Cold Start" />
          )}
          {invocation.hasError && (
            <StatusTag status="error" onClick={(status) => toggleFilter(status)} aria-label="Error" />
          )}
          </div>
        </div>
        <div className="tooltip" data-tip="Expand/Collapse"><button
          className="btn btn-primary btn-xs btn-outline"
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronUp /> : <ChevronDown />}
        </button>
        </div>
      </div>
      {open && (
        <pre className="bg-base-300 p-2 mt-2 overflow-auto text-sm rounded">
          {invocation.logs.map((log: any, idx: number) => (
            <div
              key={idx}
              className={
                invocation.hasError
                  ? "text-error font-semibold"
                  : ""
              }
            >
              {log.message.trim()}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}


