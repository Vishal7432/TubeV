function formatCount(n) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function TopVideosList({ videos, loading }) {
  if (loading) return <p className="text-sm text-[#868C99]">Loading…</p>;

  return (
    <ol className="divide-y divide-[#2C2F38] border border-[#2C2F38] rounded-lg overflow-hidden">
      {videos.map((v, i) => (
        <li key={v._id ?? i} className="flex items-center gap-4 px-5 py-4">
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
  );
}
