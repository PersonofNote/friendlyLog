'use client';

export default function PriceTiers() {
  const tiers = [
    {
      name: 'Free',
      description: 'Get started with the basics',
      price: '$0/mo',
      perks: [
        '100MB logs per month',
        'Basic search, tagging, alerting',
        '7 days retention',
      ],
      highlight: false,
    },
    {
      name: 'Pro',
      description: 'Level up your logs',
      price: '$12/mo',
      perks: [
        '1GB logs per month',
        'Advanced search, tagging, alerting',
        '14 days retention',
        'Custom Views',
      ],
      highlight: true,
    },
    {
      name: 'Team',
      description: 'For small businesses and teams',
      price: '$29/mo',
      perks: [
        '10GB logs per month',
        '30+ day retention',
        'Multi-user support',
        'API and integrations',
      ],
      highlight: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
      {tiers.map((tier, idx) => (
        <div
          key={idx}
          className={`border rounded-2xl p-6 shadow-sm flex flex-col `}
        >
          <h3 className="text-xl font-semibold mb-1">{tier.name}</h3>
          <p className="text-gray-600 mb-4">{tier.description}</p>

          <ul className="space-y-2 text-sm flex-1">
            {tier.perks.map((perk, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 me-2 inline-block text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <p className="text-2xl font-bold">{tier.price}</p>
            <a href={`/auth/signup?tier=${tier.name.toLowerCase()}`}>
              <button
                className={`btn btn-lg ${
                  tier.highlight ? 'btn-secondary' : 'btn-primary'
                }`}
              >
                {tier.name === 'Free' ? 'Start Free' : 'Choose Plan'}
              </button>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
