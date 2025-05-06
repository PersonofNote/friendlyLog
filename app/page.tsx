'use client';
import PriceTiers from "./components/PriceTiers";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <article className="prose prose-lg">
          <h1>You built the product. Let us watch the logs.</h1>
          <h2>FriendlyLog keeps an eye on performance, spending, and infrastructure so you don’t have to.
          Get clear, human-readable summaries — no engineering degree required.</h2>

          <h3>Great for:</h3>

          <ul>
            <li>Solo devs who’d rather build than babysit logs</li>
            <li>Founders who want to stay informed without micromanaging</li>
            <li>Teams that want to show progress, not just put out fires</li>
          </ul>
        </article>

        <PriceTiers />

      </main>
    </div>
  );
}
