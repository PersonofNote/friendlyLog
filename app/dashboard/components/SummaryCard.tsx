'use client';
import {  getRequestsAndErrorsCount } from "./helpers";
import { useState, useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Logs = {[key: string]: any}[];

export const SummaryCard = ({logs}: {logs: Logs}) => {
    const [errorRequests, setErrorRequests] = useState(0);
    const [totalRequests, setTotalRequests] = useState(0);
    const [healthCheck, setHealthCheck] = useState("neutral");
    const [ errorRate, setErrorRate] = useState(0);

    useEffect(() => {
        if (!logs) return;
        const { totalRequests, errorRequests, errorRate, healthCheck } = getRequestsAndErrorsCount(logs);
        setTotalRequests(totalRequests);
        setErrorRequests(errorRequests);
        setHealthCheck(healthCheck);
        setErrorRate(errorRate);
    }, [logs]);

    const healthMessage: {[key: string]: {color: string, message: string}} = {
        "good": {
            color: "success",
            message: "System is healthy"
        },
        "neutral": {
            color: "warning",
            message: "System is neutral"
        },
        "bad": {
            color: "error",
            message: "HIGH ERROR RATE DETECTED"
        }
    };

    const handleEmail = async () => {
        console.log("Handle emails")
        const response = await fetch('/api/summarize/daily', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ logs }),
        });
        const data = await response.json();
        if (data.error) {       
            console.error('Error sending email:', data.error);
        }
        if (data.success) {
            console.log('Email sent successfully:', data);
        }
    };

    return logs.length > 0 && (
        <div className="bg-base-200 p-6">
            <h2 className="text-xl font-semibold">System Summary</h2>
            <ul className="list-disc pl-5">
            <li>Requests: {totalRequests}</li>
            <li>Errors: {errorRequests} ({errorRate * 100}%)</li>
            </ul>
            {healthCheck && (
                <span className={`alert alert-outline alert-${healthMessage[healthCheck as string].color} my-4 w-75`}>{healthMessage[healthCheck].message}</span>
            )
            }
        </div>
    )
}
