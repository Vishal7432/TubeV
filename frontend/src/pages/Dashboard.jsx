import { useEffect, useState } from "react";
import { getChannelStats, getChannelVideos } from "../apis/Channel.api.js";
import StatCard from "../components/dashboard/StatCard";
import TopVideosList from "../components/dashboard/TopVideosList";
import TrendChart from "../components/charts/Trendchart.jsx";

function formatCount(n) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
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
          .slice(0, 6);
        setVideos(ranked);
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
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2DD4BF]">
            Creator studio
          </p>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl">
            Channel overview
          </h1>
          <p className="mt-1 text-sm text-[#868C99]">
            Real performance from your videos and audience
          </p>
        </div>
        {videos.length > 0 && (
          <p className="text-xs text-[#868C99]">
            Showing your top {videos.length} videos
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          value={loading ? "—" : formatCount(stats?.totalViews)}
          label="Total views"
          icon="▶"
        />
        <StatCard
          value={loading ? "—" : formatCount(stats?.totalSubscribers)}
          label="Subscribers"
          icon="◉"
        />
        <StatCard
          value={loading ? "—" : formatCount(stats?.totalLikes)}
          label="Total likes"
          icon="♥"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <TrendChart
          title="Views this week"
          data={stats?.viewsTrend ?? []}
          xKey="day"
          dataKey="views"
          variant="line"
          loading={loading}
        />
        <TrendChart
          title="New subscribers this week"
          data={stats?.subscribersTrend ?? []}
          xKey="day"
          dataKey="subscribers"
          variant="area"
          loading={loading}
        />
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg">Top performing videos</h2>
        <TopVideosList videos={videos.slice(0, 5)} loading={loading} />
      </div>
    </div>
  );
}
