import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getChannelStats, getChannelVideos } from "../api/channel.api";

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

function StatBlock({ value, label }) {
  return (
    <div className="flex-1">
      <div className="font-display text-4xl md:text-5xl tabular-nums tracking-tight">
        {value}
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-[#868C99]">{label}</span>
      </div>
    </div>
  );
}

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

      {/* Hero stat row */}
      <div className="flex flex-col sm:flex-row gap-8 pb-8 border-b border-[#2C2F38]">
        <StatBlock
          value={loading ? "—" : formatCount(stats?.totalViews)}
          label="Total views"
        />
        <StatBlock
          value={loading ? "—" : formatCount(stats?.totalSubscribers)}
          label="Subscribers"
        />
        <StatBlock
          value={loading ? "—" : formatCount(stats?.totalLikes)}
          label="Total likes"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-[#2C2F38] rounded-lg p-5">
          <h2 className="text-sm text-[#868C99] mb-4">Views this week</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_VIEWS_TREND}>
              <CartesianGrid stroke="#2C2F38" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#868C99"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#868C99"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "#1D1F26",
                  border: "1px solid #2C2F38",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#F2F3F5" }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#2DD4BF"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-[#2C2F38] rounded-lg p-5">
          <h2 className="text-sm text-[#868C99] mb-4">Subscriber growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_SUB_TREND}>
              <defs>
                <linearGradient id="subFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2C2F38" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#868C99"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#868C99"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "#1D1F26",
                  border: "1px solid #2C2F38",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#F2F3F5" }}
              />
              <Area
                type="monotone"
                dataKey="subs"
                stroke="#2DD4BF"
                fill="url(#subFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top videos ranking */}
      <div>
        <h2 className="text-sm text-[#868C99] mb-4">Top performing videos</h2>
        {loading ? (
          <p className="text-sm text-[#868C99]">Loading…</p>
        ) : (
          <ol className="divide-y divide-[#2C2F38] border border-[#2C2F38] rounded-lg overflow-hidden">
            {topVideos.map((v, i) => (
              <li
                key={v._id ?? i}
                className="flex items-center gap-4 px-5 py-4"
              >
                <span className="font-display text-lg text-[#868C99] w-6">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm">{v.title}</span>
                <span className="text-sm text-[#868C99] tabular-nums">
                  {formatCount(v.views)} views
                </span>
                <span className="text-sm text-[#2DD4BF] tabular-nums">
                  {formatCount(v.likesCount)} likes
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
