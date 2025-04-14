"use client";
import { useState } from "react";
import { ClipboardCopy, SquareArrowOutUpRight, ShieldCheck } from "lucide-react";

const steps = [
  {
    title: "Open the IAM Console",
    body: (
      <div>
        <p>Click the button below to open the AWS IAM Roles console in a new tab.</p>
        <a
          href="https://console.aws.amazon.com/iam/home#/roles"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="mt-3">
            Go to IAM Console <SquareArrowOutUpRight className="ml-2 h-4 w-4" />
          </button>
        </a>
      </div>
    ),
  },
  {
    title: "Create a Role for FriendlyLog",
    body: (
      <div>
        <p>When asked for Account ID, enter:</p>
        <CopyBlock text="123456789012" label="FriendlyLog AWS Account ID" />
        <p className="mt-4">Check "Require External ID" and enter:</p>
        <CopyBlock text="external-id-abc123" label="Your External ID" />
      </div>
    ),
  },
  {
    title: "Attach Permissions",
    body: (
      <div>
        <p>You can attach:</p>
        <ul className="list-disc ml-4">
          <li><code>CloudWatchReadOnlyAccess</code> (recommended)</li>
          <li>Or paste this custom policy:</li>
        </ul>
        <CopyBlock
          text={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:FilterLogEvents",
        "logs:GetLogEvents",
        "logs:DescribeLogGroups"
      ],
      "Resource": "*"
    }
  ]
}`}
          label="Custom Policy JSON"
          multiline
        />
      </div>
    ),
  },
  {
    title: "Name and Save",
    body: (
      <div>
        <p>Name the role <code>FriendlyLogAccess</code> or something similar.</p>
        <p className="mt-4">Once created, copy the <strong>Role ARN</strong> and paste it below:</p>
        <input
          type="text"
          placeholder="arn:aws:iam::123456789012:role/FriendlyLogAccess"
          className="w-full mt-2 p-2 border rounded"
        />
      </div>
    ),
  },
];

function CopyBlock({ text, label, multiline = false }: { text: string; label: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-2">
      <label className="text-sm font-semibold">{label}</label>
      <div className="relative mt-1">
        {multiline ? (
          <textarea
            readOnly
            value={text}
            className="w-full font-mono text-sm bg-gray-100 p-2 rounded resize-none h-40"
          />
        ) : (
          <input
            readOnly
            value={text}
            className="w-full font-mono text-sm bg-gray-100 p-2 rounded"
          />
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="absolute top-1/2 right-2 -translate-y-1/2"
        >
          {copied ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

const stepsAsList = steps.map((step, index) => (
  <div key={index}>
    <h3>{step.title}</h3>
    {step.body}
  </div>
))

export default function OnboardingWizard() {
  const [showWizard, setShowWizard] = useState(true);
  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-col lg:items-center md:justify-center h-screen">
        {showWizard ? (
        <div className="max-w-xl mx-auto p-4 md:border md:rounded-xl bg-white md:shadow-xl">
        <div className="text-xl font-semibold mb-2">Connect FriendlyLog to your AWS account</div>
        <div className="mb-4 text-sm text-gray-600">Step {step + 1} of {steps.length}</div>
        <h2 className="text-lg font-medium mb-3"><strong>{steps[step].title}</strong></h2>
            {steps[step].body}
        <div className="mt-6 flex justify-between">
            <button
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            >
            Back
            </button>
            <button
            onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
            disabled={step === steps.length - 1}
            >
            {step === steps.length - 1 ? "Done" : "Next"}
            </button>
        </div>
        </div>
        ) : <div className="flex flex-col gap-4 p-6">{stepsAsList}</div>}
        <button className="btn btn-sm btn-soft justify-self-end" onClick={() => setShowWizard(!showWizard)}>See as {showWizard ? 'list': 'wizard'}</button>
    </div>
  );
}
