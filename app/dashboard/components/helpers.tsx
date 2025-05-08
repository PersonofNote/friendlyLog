/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle, XCircle, Timer, AlertTriangle, Tag, BookText } from "lucide-react";

export function groupLogsByInvocation(events: any[]): any[] {
  const invocations: any[] = [];
  let currentInvocation: any | null = null;
  let lastInitStartTime: number | null = null;
  let coldStartDuration: number | null = null;
  
  for (const event of events) {
    const msg = event.message;
    let status;

    const firstWordMatch = msg.match(/^\s*(\S+)/);
    const title = firstWordMatch ? firstWordMatch[1] : undefined;

    const lineHasError = msg.includes("ERROR") || msg.includes("Exception");
    
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
        hasError: lineHasError,
        coldStart: isColdStart,
        coldStartDuration: isColdStart ? coldStartDuration : undefined
      };
      invocations.push(currentInvocation);

    } else if (msg.startsWith('REPORT RequestId:')) {
      // Extract duration from the REPORT line (for all requests, not just cold starts)
      // TODO: get memory used out of available
      const durationMatch = msg.match(/Duration: ([\d.]+) ms/);
      const durationMs = durationMatch ? parseFloat(durationMatch[1]) : undefined;
      const statusMatch = msg.match(/Status:\s*(\w+)/);
      // eslint-disable-next-line
      statusMatch && (status = statusMatch[1]);

      if (currentInvocation) {
        currentInvocation.logs.push(event);
        currentInvocation.endTime = event.timestamp;
        (currentInvocation as any).durationMs = durationMs;
        (currentInvocation as any).status = status;
        currentInvocation.hasError = currentInvocation.hasError || lineHasError;
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
          hasError: lineHasError
        });
      }

    } else {
      // If there is no match (just additional logs), continue grouping in the current invocation
      if (currentInvocation) {
        currentInvocation.logs.push(event);
        currentInvocation.hasError = currentInvocation.hasError || lineHasError;
      } else {
        invocations.push({
          title,
          requestId: 'unknown',
          startTime: event.timestamp,
          logs: [event],
          status,
          hasError: lineHasError
        });
      }
    }
  }

  if (lastInitStartTime && currentInvocation) {
    coldStartDuration = currentInvocation.startTime - lastInitStartTime;
  }

  return invocations;
}

export function getRequestsAndErrorsCount(logs: any[]): { totalRequests: number; errorRequests: number, errorRate: number, healthCheck: string } {
  let totalRequests = 0;
  let errorRequests = 0;
  let healthCheck = "neutral";

  for (const log of logs) {
    if (log.requestId !== "unknown") {
      totalRequests++;
    };
    if (log.hasError || log.status === "error") {
      errorRequests++;
    };
  }

  const errorRate = errorRequests / totalRequests;

  if (errorRate > 0.5) {
    healthCheck = "bad";
  } else if (errorRate < 0.2) {
    healthCheck = "good";
  }
  else {  
    healthCheck = "neutral";
  };

  return { totalRequests, errorRequests, errorRate, healthCheck };
};


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
  