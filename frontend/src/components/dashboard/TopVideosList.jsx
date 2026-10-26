import { Link } from "react-router-dom";

function formatCount(n) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function TopVideosList({ videos, loading }) {
  if (loading) return <p className="text-sm text-[#868C99]">Loading…</p>;

  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#3A3D47] bg-[#1A1B21] px-5 py-8 text-center">
        <p className="font-medium">Your channel is ready for its first video</p>
        <p className="mt-1 text-sm text-[#868C99]">
          Publish a video to start building your channel stats.
        </p>
        <Link
          to="/upload"
          className="mt-4 inline-flex rounded-full bg-[#2DD4BF] px-5 py-2 text-sm font-medium text-[#0B0C0F] transition-colors hover:bg-[#2DD4BF]/90"
        >
          Upload a video
        </Link>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-[#2C2F38] border border-[#2C2F38] rounded-lg overflow-hidden">
      {videos.map((v, i) => (
        <li
          key={v._id ?? i}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-5 sm:py-4"
        >
          <span className="w-6 shrink-0 font-display text-lg text-[#868C99]">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 basis-[calc(100%-2.25rem)] text-sm sm:basis-0">
            {v.title}
          </span>
          <span className="ml-9 text-xs text-[#868C99] tabular-nums sm:ml-0 sm:text-sm">
            {formatCount(v.views)} views
          </span>
          <span className="text-xs text-[#2DD4BF] tabular-nums sm:text-sm">
            {formatCount(v.likesCount)} likes
          </span>
        </li>
      ))}
    </ol>
  );
}
