# 🌤️ CloudWatch for Humans

> Human-friendly summaries of AWS CloudWatch metrics, logs, and alerts — without needing to be a cloud engineer.

---

## 🧠 What It Does

CloudWatch for Humans helps **non-technical users** (or busy devs) understand their AWS application health at a glance. Instead of raw metrics, it shows:

- 🟢 **Integration status** with your AWS account
- 📊 **Summarized trends** in key logs & alerts
- 💡 **Plain language insights** like “Errors spiked 40% after your last deployment”

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/cloudwatch-for-humans.git
cd cloudwatch-for-humans
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
AWS_ROLE_ARN=your-cross-account-role
```

Or run the following command

```bash
cp .env.example .env.local
```

### 4. Run the app

```bash
npm run dev
```

🛠 Project Structure

├── components/          # Reusable UI components
├── lib/                 # Supabase and AWS utilities
├── pages/               # Next.js routes and APIs
├── styles/              # Global CSS
├── .env.example         # Environment variable template
└── README.md            # You're here!

📦 Tech Stack
Next.js – SSR-friendly React framework

Supabase – Auth + DB

AWS SDK v3 – Programmatic CloudWatch access

💰 Pricing Model
This project is designed as a freemium SaaS:

Free Tier: 1 AWS integration, single dashboard

Pro Tier: multiple integrations, email alerts, customizable summaries

📌 Roadmap
 Basic Supabase auth flow

 AWS integration wizard

 Daily summary email

 Team dashboards

🧑‍💻 Contributing
PRs welcome! File issues or feature requests under the Issues tab.

