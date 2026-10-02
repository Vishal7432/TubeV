export default function SearchBar({
  value,
  onChange,
  placeholder = "Search your videos",
}) {
  return (
    <div className="relative max-w-sm">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1D1F26] border border-[#2C2F38] rounded-md px-4 py-2 text-sm
                   text-[#F2F3F5] placeholder:text-[#868C99] focus:outline-none
                   focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent"
      />
    </div>
  );
}
