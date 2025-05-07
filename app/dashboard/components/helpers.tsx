import { CheckCircle, XCircle, Timer, AlertTriangle, Tag, BookText } from "lucide-react";
/*
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
    */
   /*
  export function groupLogsByInvocation(events: LogEvent[]): Invocation[] {
    const invocations: Invocation[] = [];
    let currentInvocation: Invocation | null = null;
    let lastInitStartTime: number | null = null; // Track the timestamp of the last INIT_START event

    for (const event of events) {
      const msg = event.message;
      let status;

      const firstWordMatch = msg.match(/^\s*(\S+)/);
      const title = firstWordMatch ? firstWordMatch[1] : undefined;

      const hasError = msg.includes("ERROR") || msg.includes("Exception");

      // Detect INIT_START and START events
      if (msg.startsWith('START RequestId:') || msg.startsWith('INIT_START')) {
        const requestIdMatch = msg.match(/START RequestId: ([\w-]+)/);
        const requestId = requestIdMatch ? requestIdMatch[1] : 'unknown';
  
        // Cold Start detection: INIT_START is just before the first START for a request
        const isColdStart = msg.startsWith('INIT_START') && lastInitStartTime === null;
        if (msg.startsWith('INIT_START')) {
          lastInitStartTime = event.timestamp; // Store the timestamp for future reference
        }

        currentInvocation = {
          title,
          requestId,
          startTime: event.timestamp,
          logs: [event],
          status,
          hasError: hasError,
          coldStart: isColdStart // Add the cold start flag here
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
          currentInvocation = null; // End current invocation after REPORT
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
        // For all other events, group under the most recent invocation
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
*/

export function groupLogsByInvocation(events: LogEvent[]): Invocation[] {
  const invocations: Invocation[] = [];
  let currentInvocation: Invocation | null = null;
  let lastInitStartTime: number | null = null; // Timestamp of the last INIT_START event
  let coldStartDuration: number | null = null; // Track the duration of cold starts
  
  for (const event of events) {
    const msg = event.message;
    let status;

    const firstWordMatch = msg.match(/^\s*(\S+)/);
    const title = firstWordMatch ? firstWordMatch[1] : undefined;

    const hasError = msg.includes("ERROR") || msg.includes("Exception");
    const isTimeout = msg.includes("Timeout");
    
    // Check for cold start events
    if (msg.startsWith('START RequestId:') || msg.startsWith('INIT_START')) {
      const requestIdMatch = msg.match(/START RequestId: ([\w-]+)/);
      const requestId = requestIdMatch ? requestIdMatch[1] : 'unknown';

      // If INIT_START event is detected, check if it's the first one
      const isColdStart = msg.startsWith('INIT_START') && lastInitStartTime === null;
      if (msg.startsWith('INIT_START')) {
        lastInitStartTime = event.timestamp; // Mark the start of cold start
      }

      // Create or update the invocation with cold start data
      currentInvocation = {
        title,
        requestId,
        startTime: event.timestamp,
        logs: [event],
        status,
        hasError: hasError,
        coldStart: isColdStart,
        coldStartDuration: isColdStart ? coldStartDuration : undefined // Add cold start duration
      };
      invocations.push(currentInvocation);

    } else if (msg.startsWith('REPORT RequestId:')) {
      // Extract duration from the REPORT line (for all requests, not just cold starts)
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
        currentInvocation = null; // End current invocation after REPORT
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
      // If there is no match (just additional logs), continue grouping in the current invocation
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

  // Update cold start duration after processing all logs
  if (lastInitStartTime && currentInvocation) {
    coldStartDuration = currentInvocation.startTime - lastInitStartTime; // Calculate cold start duration
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
  