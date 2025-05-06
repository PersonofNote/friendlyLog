import { CheckCircle, XCircle, Timer, AlertTriangle, Tag, BookText } from "lucide-react";

export function groupLogsByInvocation(events: LogEvent[]): Invocation[] {
    const invocations: Invocation[] = [];
    let currentInvocation: Invocation | null = null;
  
    for (const event of events) {
      const msg = event.message;
      let status;

      const firstWordMatch = msg.match(/^\s*(\S+)/);
      const title = firstWordMatch ? firstWordMatch[1] : undefined;

      const hasError = msg.includes("ERROR") || msg.includes("Exception");
    
      if (msg.startsWith('START RequestId:') || msg.startsWith('INIT_START')) {
        const requestIdMatch = msg.match(/START RequestId: ([\w-]+)/);
        const requestId = requestIdMatch ? requestIdMatch[1] : 'unknown';
  
        currentInvocation = {
          title,
          requestId,
          startTime: event.timestamp,
          logs: [event],
          status,
          hasError: hasError
        };
        invocations.push(currentInvocation);
  
      } else if (msg.startsWith('REPORT RequestId:')) {
        // Extract duration from REPORT line
        const durationMatch = msg.match(/Duration: ([\d.]+) ms/);
        const durationMs = durationMatch ? parseFloat(durationMatch[1]) : undefined;
        const statusMatch = msg.match(/Status:\s*(\w+)/);
        statusMatch && (status = statusMatch[1]);
        if (currentInvocation) {
          currentInvocation.logs.push(event);
          currentInvocation.endTime = event.timestamp;
          (currentInvocation as any).durationMs = durationMs;
          (currentInvocation as any).status = status;
          (currentInvocation as any).hasError = hasError;
          currentInvocation = null;
        } else {
          invocations.push({
            title,
            requestId: 'unknown',
            startTime: event.timestamp,
            endTime: event.timestamp,
            logs: [event],
            durationMs,
            status,
            hasError
          });
        }
  
      } else {
        if (currentInvocation) {
          currentInvocation.logs.push(event);
        } else {
          invocations.push({
            title,
            requestId: 'unknown',
            startTime: event.timestamp,
            logs: [event],
            status,
            hasError: hasError
          });
        }
      }
    }
  
    return invocations;
  }

export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "text-green-600";
      case "timeout":
        return "text-orange-500";
      case "error":
      case "fail":
      case "failed":
      case "errordetails":
        return "text-red-600";
      case "throttled":
      case "outofmemory":
        return "text-yellow-500";
      default:
        return "text-gray-600";
    }
  };
  
export const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "timeout":
        return <Timer className="w-4 h-4" />;
      case "error":
      case "fail":
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "errordetails":
        return <BookText className="w-4 h-4" />;
      case "throttled":
      case "outofmemory":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };
  
export const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "Success";
      case "timeout":
        return "Timeout";
      case "error":
      case "fail":
      case "failed":
        return "Error";
      case "errordetails":
        return "Error Details";
      case "throttled":
      case "outofmemory":
        return "Throttled";
      default:
        return "Unknown";
    }
  };
  