export const SummaryCard = ({user}) => {
    return (
        <div className="bg-base-200 p-6">

            <h2 className="text-xl font-semibold">System Health Overview</h2>
            <ul className="list-disc pl-5">
            <li>Uptime: 100%</li>
            <li>Average Response Time: 248ms <span className="text-green-600">(↓ 12% from yesterday)</span></li>
            <li>Error Rate: 0.8% <span className="text-yellow-600">(↑ slight bump)</span></li>
            <li>Deployments: 1 (v2.1.7 at 3:03 PM)</li>
            </ul>

            <button className="btn btn-primary">View Details</button>
        </div>
    )
}
