export default function FilterChips({ filters, active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f.label}
          onClick={() => onChange(f)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            active.label === f.label
              ? "bg-[#F2F3F5] text-[#14151A] border-[#F2F3F5]"
              : "border-[#2C2F38] text-[#868C99] hover:text-[#F2F3F5] hover:border-[#F2F3F5]/30"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
