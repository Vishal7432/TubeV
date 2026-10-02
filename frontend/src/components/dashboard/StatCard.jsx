export default function StatCard({ value, label }) {
  return (
    <div className="flex-1">
      <div className="font-display text-4xl md:text-5xl tabular-nums tracking-tight">
        {value}
      </div>
      <div className="mt-2 text-sm text-[#868C99]">{label}</div>
    </div>
  );
}