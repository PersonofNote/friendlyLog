

export default function TermsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Terms of Use</h1>
        <p className="mb-4">
            By using FriendlyLog, you agree to our Terms of Use and Privacy Policy.
        </p>
        <div className="w-full max-w-2xl bg-base-100 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
            <div>
  <h1>Privacy Policy</h1>
  <p><strong>Effective Date:</strong> [Insert Date]</p>

  <p>At FriendlyLog, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal data when you use our website and services.</p>

  <h2>1. Information We Collect</h2>
  <p>We may collect the following information:</p>
  <ul>
    <li><strong>Email address</strong> (used for authentication and sending summaries)</li>
    <li><strong>CloudWatch log data</strong> you connect to FriendlyLog</li>
    <li><strong>Usage analytics</strong> (such as page visits and button clicks via Vercel Analytics or similar)</li>
  </ul>
  <p>We <strong>do not sell or share</strong> your personal data with third parties.</p>

  <h2>2. How We Use Your Information</h2>
  <ul>
    <li>Authenticate your access to the dashboard</li>
    <li>Display and summarize your logs</li>
    <li>Send you daily or periodic summary emails (if enabled)</li>
    <li>Improve and maintain the service</li>
  </ul>

  <h2>3. Data Storage</h2>
  <p>Your data is stored securely using <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer">Supabase</a> and is only accessible to you and our system processes.</p>

  <h2>4. Email Preferences</h2>
  <p>You may opt in or out of summary emails at any time from your settings.</p>

  <h2>5. Third-Party Services</h2>
  <p>We use services like Supabase, Vercel, and Resend to provide and improve FriendlyLog. These services have their own privacy policies.</p>

  <h2>6. Changes</h2>
  <p>We may update this Privacy Policy as our service evolves. When we do, we’ll notify you through the app or via email.</p>

  <h2>7. Contact</h2>
  <p>If you have questions, email us at <a href="mailto:you@example.com">you@example.com</a>.</p>
</div>

            <p className="mb-4">
            </p>
        </div>
        <div className="w-full max-w-2xl bg-base-100 shadow-md rounded-lg p-6 mt-4">
            <h2 className="text-xl font-semibold mb-4">Terms of Use</h2>
            <p className="mb-4">
            By using FriendlyLog, you agree to our Terms of Use. Please read them carefully.
            </p>
            <div>
  <h1>Terms of Use</h1>
  <p><strong>Effective Date:</strong> [Insert Date]</p>

  <p>By using FriendlyLog, you agree to the following terms and conditions.</p>

  <h2>1. Description of Service</h2>
  <p>FriendlyLog helps developers and teams summarize and interpret AWS CloudWatch logs in a friendlier format.</p>

  <h2>2. Eligibility</h2>
  <p>You must be 13 years or older to use FriendlyLog.</p>

  <h2>3. Account Responsibilities</h2>
  <p>You are responsible for maintaining the confidentiality of your login credentials and the accuracy of your user information.</p>

  <h2>4. Acceptable Use</h2>
  <p>You agree not to:</p>
  <ul>
    <li>Use the service for illegal or abusive purposes</li>
    <li>Attempt to access other users’ data</li>
    <li>Reverse engineer or resell the platform</li>
  </ul>

  <h2>5. Limitation of Liability</h2>
  <p>FriendlyLog is provided “as is.” We do not guarantee uptime, accuracy, or data retention. We are not liable for damages arising from the use or inability to use the service.</p>

  <h2>6. Modifications</h2>
  <p>We may change the features or terms of the service at any time. We’ll try to notify users of major changes in advance.</p>

  <h2>7. Termination</h2>
  <p>We reserve the right to terminate accounts that violate these terms or misuse the service.</p>

  <h2>8. Contact</h2>
  <p>Questions? Email us at <a href="mailto:you@example.com">you@example.com</a>.</p>
</div>

        </div>
        </div>
    );
}

