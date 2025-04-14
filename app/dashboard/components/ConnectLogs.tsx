export const ConnectLogs = () => {
    return (
        <div>
            <h1>Connect Logs</h1>
            <p>To generate your daily AWS-friendly reports, we need read-only access to your CloudWatch Logs.</p>
            <pre>
                {
                "Version": "2012-10-17",
                "Statement": [
                    {
                    "Effect": "Allow",
                    "Action": [
                        "logs:DescribeLogGroups",
                        "logs:FilterLogEvents"
                    ],
                    "Resource": "*"
                    }
                ]
                }
            </pre>
        </div>
    )
}