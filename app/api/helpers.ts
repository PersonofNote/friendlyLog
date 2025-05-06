import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

const sts = new STSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function withAssumedRole<T>(
  roleArn: string,
  externalId: string,
  callback: (creds: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  }) => Promise<T>
): Promise<T> {
  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: `FriendlyLog-session`,
    ExternalId: externalId,
    DurationSeconds: 900, // 15 min
  });

  const response = await sts.send(command);

  if (!response.Credentials) {
    throw new Error("Failed to assume role");
  }

  const tempCreds = {
    accessKeyId: response.Credentials.AccessKeyId!,
    secretAccessKey: response.Credentials.SecretAccessKey!,
    sessionToken: response.Credentials.SessionToken!,
  };

  return callback(tempCreds);
}
