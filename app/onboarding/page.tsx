"use client";
import { useState, useEffect } from "react";
import { ClipboardCopy, ClipboardCheck, SquareArrowOutUpRight } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from "next/navigation";

function CopyBlock({ text, label, multiline = false }: { text: string; label: string; multiline?: boolean }) {
    const [copied, setCopied] = useState(false);

    return (
        <div className="mt-2">
            <label className="text-sm font-semibold">{label}</label>
            <div className="w-full border rounded p-2 m-2 dark:bg-black relative">
                <pre className="font-mono text-sm">{text}</pre>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                    }}
                    className={`absolute ${multiline ? "top-1" : "top-2"} right-2`}
                >
                    {copied ? <div className="tooltip" data-tip="Copied!"><ClipboardCheck className="h-4 w-4 text-green-500" /></div> : <div className="tooltip" data-tip="Copy to clipboard"><ClipboardCopy className="h-4 w-4" /></div>}
                </button>
            </div>
        </div>
    );
}

const processLogGroups = (logGroups: string[]) => {
    return logGroups.map(group => ({
        value: group,
        label: group.split('/')[3] || group
    }));
}


export default function OnboardingWizard() {
    const [externalId, setExternalId] = useState<string | null>(null)
    const [showWizard, setShowWizard] = useState(true);
    const [step, setStep] = useState(0);
    const [roleArn, setRoleArn] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [groupNames, setGroupNames] = useState<{ value: string; label: string }[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        console.log('Selected groups:', selectedGroups)
    }, [selectedGroups])

    useEffect(() => {
        const fetchExternalId = async () => {
          const supabase = createClient()
    
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser()
    
          if (userError) {
            console.error('Error fetching user:', userError)
            return
          }
    
          if (!user) {
            console.warn('No user found')
            return
          }
    
          const { data: profile, error: profileError } = await supabase
            .from('friendlylog_user_settings')
            .select('external_id')
            .eq('user_id', user.id)
            .single()
    
          if (profileError) {
            console.error('Error fetching profile:', profileError)
            return
          }
    
          setExternalId(profile.external_id)
        }
    
        fetchExternalId()
      }, [])

      useEffect(() => {
        console.log("Group names:", groupNames)
        console.log("Selected groups:", selectedGroups)
      }, [selectedGroups, groupNames])  

    const handleConnect = async () => {
        setError(null)
        setMessage(null)
        console.log("Role ARN:", roleArn)
        console.log("External ID:", externalId)
        try {
            const response = await fetch("/api/aws/connect", {
                method: "POST",
                body: JSON.stringify({ roleArn, externalId }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (data.success) {
                setMessage("Successfully connected to AWS");
                setError(null);
                setGroupNames(processLogGroups(data.groupNames));
                setStep((s) => Math.min(s + 1, steps.length - 1))
            } else {
                setError(data.error);
            }
        } catch (error) {
                console.error('Error connecting to AWS:', error)
                setError('Failed to connect to AWS')
        }
    };

    const handleGroupChoice = async (selectedLogGroups: string[]) => {
        // TODO: limit allowed number of logGroups based on permissions
        // TODO: Implement some kind of filtering/searching if they have tons of groups
        // TODO: Distinguish among logtypes, for example I have 7 just named "Endpoints"
        setError(null)
        setMessage(null)
        try {
            const response = await fetch("/api/logs/logGroups", {
                method: "POST",
                body: JSON.stringify({ selectedLogGroups }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (data.success) {
                setMessage("Successfully saved selected log groups. Redirecting to dashboard...");
                setError(null);
                setStep((s) => Math.min(s + 1, steps.length - 1))
                setTimeout(() => {
                    router.replace("/dashboard")
                }, 5000)
            } else {
                setError(data.error);
            }
        } catch (error) {
                console.error('Error saving selected log groups:', error)
                setError('Failed to save selected log groups')
        }
    };

    const steps = [
        {
            title: "What you're about to do",
            body: (
                <div>
                    <p>You’re about to connect AWS so FriendlyLog can read logs for your project.
                        This doesn’t give us access to write anything, and we’ll never see your credentials. You’ll create a read-only role that only shares logs you already use.</p>
                </div>
            )
        },
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
                    <p className="mt-4">Click the &quot;Create role&quot; button and select &quot;AWS Account&quot; as the trusted entity type.</p>
                </div>
            ),
        },
        {
            title: "Create a Role for FriendlyLog",
            body: (
                <div>
                    <p>When asked for Account ID, enter:</p>
                    <CopyBlock text="029517665595" label="FriendlyLog AWS Account ID" />
                    <p className="mt-4">Check &quot;Require external ID&quot; and enter:</p>
                    <CopyBlock text={externalId || ""} label="Your External ID" />
                    <p className="mt-4">Enter a name for the role:</p>
                    <input
                        type="text"
                        placeholder="FriendlyLogAccess"
                        className="w-full mt-2 p-2 border rounded"
                    />
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
                        value={roleArn}
                        onChange={(e) => setRoleArn(e.target.value)}
                        placeholder="arn:aws:iam::123456789012:role/FriendlyLogAccess"
                        className="w-full mt-2 p-2 border rounded"
                    />
                    <button onClick={handleConnect} className="btn btn-primary mt-2">Connect</button>
                </div>
            ),
        },
        {
            title: "Select Log Groups",
            body: (
                <div>
                    <p>Choose the log groups you want to monitor:</p>
                    {groupNames.length === 0 && <p>Log groups will be fetched from AWS after you connect</p>}
                    <div className="mt-2">
                        {groupNames.map((name, index) => (
                            <label key={index} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    value={name.value}
                                    checked={selectedGroups.includes(name.value)}
                                    onChange={() => setSelectedGroups((prev) =>
                                        prev.includes(name.value)
                                          ? prev.filter(g => g !== name.value)
                                          : [...prev, name.value]
                                    )}
                                    className="mr-2"
                                />
                                <span>{name.label}</span>
                            </label>
                        ))}
                    </div>
                    <button onClick={() => handleGroupChoice(selectedGroups)} className="btn btn-primary mt-2">Done</button>
                </div>
            ),
        },
    ];

    const stepsAsList = steps.map((step, index) => (
        <li className="pb-6" key={index}>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            {step.body}
        </li>
    ))
    
    return (
        <div className="flex flex-col lg:items-center md:justify-center min-h-screen">
            {showWizard ? (
                <div className="max-w-xl mx-auto p-4 md:border md:rounded-xl bg-white dark:bg-black md:shadow-xl m-6">
                    <div className="text-xl font-semibold mb-2">Connect FriendlyLog to your AWS account</div>
                    <div className="mb-4 text-sm text-gray-600">Step {step + 1} of {steps.length}</div>
                    <h2 className="text-lg font-medium mb-3"><strong>{steps[step].title}</strong></h2>
                    {steps[step].body}
                    {error && <div className="text-error mt-2">{error}</div>}
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
            ) : (<div className="flex flex-col gap-4 p-6">
                <div className="text-xl font-semibold mb-2">Connect FriendlyLog to your AWS account</div>
                <ol className="list-decimal ml-5">{stepsAsList}</ol>
                {message && <div className="text-green-500 mt-2">{message}</div>}
                {error && <div className="text-error mt-2">{error}</div>}
            </div>)}
            <button className="btn btn-sm btn-soft justify-self-end" onClick={() => setShowWizard(!showWizard)}>Show as {showWizard ? 'list' : 'wizard'}</button>
        </div>
    );
}
