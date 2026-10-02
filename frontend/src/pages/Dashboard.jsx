import { useEffect, useState } from "react";
import { getChannelStats, getChannelVideos } from "../apis/Channel.api.js";
import StatCard from "../components/dashboard/StatCard";
import TopVideosList from "../components/dashboard/TopVideosList";
import TrendChart from "../components/charts/Trendchart.jsx";

// No history endpoint on this backend yet, so trend lines stay illustrative
// until a time-series route exists. Swap these for real data once you add one.
const MOCK_VIEWS_TREND = [
  { day: "Mon", views: 1200 },
  { day: "Tue", views: 1900 },
  { day: "Wed", views: 1700 },
  { day: "Thu", views: 2400 },
  { day: "Fri", views: 2100 },
  { day: "Sat", views: 3000 },
  { day: "Sun", views: 3400 },
];

const MOCK_SUB_TREND = [
  { day: "Mon", subs: 820 },
  { day: "Tue", subs: 834 },
  { day: "Wed", subs: 851 },
  { day: "Thu", subs: 879 },
  { day: "Fri", subs: 902 },
  { day: "Sat", subs: 940 },
  { day: "Sun", subs: 981 },
];

function formatCount(n) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topVideos, setTopVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsData, videos] = await Promise.all([
          getChannelStats(),
          getChannelVideos(),
        ]);
        if (cancelled) return;
        setStats(statsData);
        const ranked = [...videos]
          .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
          .slice(0, 5);
        setTopVideos(ranked);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="text-sm text-[#868C99]">
        Couldn&apos;t load channel data.{" "}
        <button
          onClick={() => window.location.reload()}
          className="text-[#2DD4BF] underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl">Overview</h1>
        <p className="text-sm text-[#868C99] mt-1">Last 7 days, all videos</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 pb-8 border-b border-[#2C2F38]">
        <StatCard
          value={loading ? "—" : formatCount(stats?.totalViews)}
          label="Total views"
        />
        <StatCard
          value={loading ? "—" : formatCount(stats?.totalSubscribers)}
          label="Subscribers"
        />
        <StatCard
          value={loading ? "—" : formatCount(stats?.totalLikes)}
          label="Total likes"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <TrendChart
          title="Views this week"
          data={MOCK_VIEWS_TREND}
          xKey="day"
          dataKey="views"
          variant="line"
        />
        <TrendChart
          title="Subscriber growth"
          data={MOCK_SUB_TREND}
          xKey="day"
          dataKey="subs"
          variant="area"
        />
      </div>

      <div>
        <h2 className="text-sm text-[#868C99] mb-4">Top performing videos</h2>
        <TopVideosList videos={topVideos} loading={loading} />
      </div>
    </div>
  );
}
