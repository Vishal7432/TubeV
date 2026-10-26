export default function StatCard({ value, label, icon }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#2C2F38] bg-[#1A1B21] p-5 transition-colors hover:border-[#2DD4BF]/40 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-[#A2A8B4]">{label}</span>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-lg text-[#2DD4BF]"
        >
          {icon}
        </span>
      </div>
      <div className="mt-4 font-display text-3xl tabular-nums tracking-tight sm:text-4xl">
        {value}
      </div>
    </div>
  );
}
