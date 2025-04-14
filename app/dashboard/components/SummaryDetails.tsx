export const SummaryDetails = () => {
    return (
        <div>
            <h1>FriendlyLog - Daily Report ({new Date().toLocaleDateString()})</h1>
            <div className="flex items-center gap-2">
                <div className="inline-grid *:[grid-area:1/1]">
                    <div className="status status-success animate-ping status-xl"></div>
                    <div className="status status-success status-xl"></div>
                </div> Server is up!
            </div>
            <p>Everything looks good — with one thing to check.</p>
            <p>Here’s a quick look at how your systems performed today.</p>
            <h2> System Health Overview</h2>
            <h2> Notable Events </h2>
            <h2> Spending Watch </h2>
            <h2> Suggestions </h2>
            <div className="flex justify-center">
            <div>Want to share this?</div>
            </div>
        </div>
    );
};