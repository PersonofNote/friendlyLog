import * as React from 'react';

interface EmailTemplateProps {
  logSummaries: Record<string, { total_requests: number; error_requests: number }>;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  logSummaries
}) => (
  <div>
    <h1>FriendlyLog Daily Report</h1>
    <p>Here are your log summaries:</p>
    <ul>
      {Object.entries(logSummaries).map(([logGroupName, { total_requests, error_requests }]) => (
        <li key={logGroupName}>
          <strong>{logGroupName}</strong>: {total_requests} requests, {error_requests} errors
        </li>
      ))}
    </ul>
    <p>Stay informed,</p>
    <p>Your FriendlyLog</p>
    <p>—</p>
    <p>FriendlyLog is a tool to help you monitor your AWS logs and get insights into your system's health.</p>
    <p>For more information, visit our website.</p>
    <p>© 2025 FriendlyLog. All rights reserved.</p>
  </div>
);