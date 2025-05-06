import { useState } from "react";
import { groupLogsByInvocation } from "./helpers";
import { StatusTag } from "./StatusTag";
import { ChevronDown, ChevronUp, Funnel } from "lucide-react";

export function LogViewer({ events }: { events: any[] }) {
  const [filter, setFilter] = useState("all");
  const invocations = groupLogsByInvocation(events);
    console.log("INVOCATIONS")
    console.log(invocations)
    console.log(invocations.map((invocation: any) => new Date(invocation.startTime).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      })))
  const filteredInvocations = filter
  ? invocations.filter((invocation: any) =>
      filter === "all" ? invocation : invocation.status?.includes(filter)
    )
  : invocations;

  return (
    <div>
        {filter !== "all" && <div className="flex items-center gap-2"><Funnel className="w-4 h-4" aria-label="Filter" />| <StatusTag status={filter} onClick={() => setFilter("all")} aria-label="Clear filter"/></div>}
      {filteredInvocations.map((invocation, idx) => (
        <InvocationBlock key={idx} invocation={invocation} filter={filter} setFilter={setFilter} />
      ))}
    </div>
  );
}

function InvocationBlock({ invocation, filter, setFilter }: { invocation: any, filter: string, setFilter: (filter: string) => void }) {
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
      <div className="flex justify-between">
        <div className="flex flex-col lg:flex-row items-center">
          <span className="text-sm font-mono lg:w-40 inline-block">{logTime}</span>
          <div className="flex items-center gap-2">
          {invocation.status && (
            <StatusTag status={invocation.status} onClick={(status) => setFilter(status)} />
          )}
          {invocation.durationMs && (
            <span className="ml-2 text-sm text-gray-600">
              ⏱ {invocation.durationMs} ms
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


