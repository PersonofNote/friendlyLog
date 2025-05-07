/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Fix filtering
import { useState, useEffect } from "react";
import { groupLogsByInvocation } from "./helpers";
import { StatusTag } from "./StatusTag";
import { ChevronDown, ChevronUp, Funnel, Timer, ThermometerSnowflake } from "lucide-react";
import { noLogs } from "./noLogs";

export function LogViewer({ events, sortOrder, loading }: { events: any[], sortOrder: 'asc' | 'desc', loading: boolean }) {
  const [filter, setFilter] = useState("all");
  const invocations = groupLogsByInvocation(events);
  const [sortedLogs, setSortedLogs] = useState<any[]>(invocations);
        
  const sortLogs = () => {
    const sorted = [...invocations].sort((a: any, b: any) => {
        const aTime = a.startTime
        const bTime = b.startTime
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });
    setSortedLogs(sorted);
};

  const filteredLogs = filter
  ? sortedLogs.filter((invocation: any) =>
      filter === "all" ? invocation : invocation.status?.includes(filter)
    )
  : sortedLogs;

  useEffect(() => {
    sortLogs();
  }, [sortOrder]);

  useEffect(() => {
    console.log(events)
    console.log("FILTER")
    console.log(sortedLogs)
    console.log(filteredLogs)
  }, [events, filter, sortOrder]);

  return loading ?  (<span className="loading loading-ring loading-xs"></span>)   : (
    <div>
        {filter !== "all" && <div className="flex items-center gap-2"><Funnel className="w-4 h-4" aria-label="Filter" />| <StatusTag status={filter} onClick={() => setFilter("all")} aria-label="Clear filter"/></div>}
      {filteredLogs.length === 0 ? noLogs : filteredLogs.map((invocation, idx) => (
        <InvocationBlock key={idx} invocation={invocation} setFilter={setFilter} />
      ))}
    </div>
  );
}

function InvocationBlock({ invocation, setFilter }: { invocation: any, setFilter: (filter: string) => void }) {
  const [open, setOpen] = useState(false);

  const logTime = new Date(invocation.startTime).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  })

  const hasError = invocation.logs.some((log: any) => log.message.includes("ERROR") || log.message.includes("Exception"));

  return (
    <div
      className={`border rounded p-2 my-2 ${
         hasError || invocation.status === "error" || invocation.status === "fail" || invocation.status === "failed" || invocation.status === "errordetails" ? "border-red-500" : "border-gray-300"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-row flex-wrap items-center">
          <span className="text-sm font-mono lg:w-40 inline-block">{logTime}</span>
          <div className="flex items-center gap-2 flex-grow">
          {invocation.status && (
            <StatusTag status={invocation.status} onClick={(status) => setFilter(status)} aria-label="Status" />
          )}
          {invocation.durationMs && (
            <span className="ml-2 text-sm text-gray-600 flex gap-1 items-center">
              <Timer className="w-4 h-4" aria-label="Duration" /> {invocation.durationMs} ms
            </span>
          )}
          {/* TODO: consider adding coldStart to status? Depends on grouping. Possibly make status an array of tags */}
          {invocation.coldStart && (
            <span className="ml-2 text-sm text-blue-600 flex gap-1 items-center">
              <ThermometerSnowflake className="w-4 h-4" aria-label="Cold Start" /> Cold Start
            </span>
          )}
          {hasError && (
            <StatusTag status="error" onClick={(status) => setFilter(status)} aria-label="Error" />
          )}
          </div>
        </div>
        <div className="tooltip" data-tip="Expand/Collapse"><button
          className="btn btn-accent btn-xs btn-outline"
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
                hasError
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


