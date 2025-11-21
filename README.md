# 🌤️ FriendlyLog

> Human-friendly summaries of AWS CloudWatch metrics, logs, and alerts — without needing to be a cloud engineer.

---

## 🧠 What It Does

FriendlyLog helps **non-technical users** (or busy devs) understand their AWS application health at a glance.

- 🦚 **Prettified Logs** The Cloudwatch UI is ugly. Friendlylog, less so.
- 📊 **Summarized trends** in key logs & alerts - coming soon
- 💡 **Plain language insights** like “Errors spiked 40% after your last deployment” - coming soon

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/PersonOfNote/friendlyLog.git
cd friendlyLog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region
AWS_ROLE_ARN=your-aws-role-arn
```

### 4. Run the app

```bash
npm run dev
```

📦 Tech Stack
Next.js – SSR-friendly React framework

Supabase – Auth + DB

AWS SDK v3 – Programmatic CloudWatch access

📌 Roadmap
 Basic Supabase auth flow ✅

 AWS integration wizard/onboarding ✅

 Pretty logs ✅

 Daily summary email ✅

 Subscription implementation

 Graphs

 Plain-language alerts and rule setting

🧑‍💻 Contributing

File issues or feature requests under the Issues tab.


