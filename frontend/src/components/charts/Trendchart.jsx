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

const tooltipStyle = {
  contentStyle: {
    background: "#1D1F26",
    border: "1px solid #2C2F38",
    borderRadius: 8,
  },
  labelStyle: { color: "#F2F3F5" },
};

/**
 * variant: "line" | "area"
 * data: [{ [xKey]: string, [dataKey]: number }]
 */
export default function TrendChart({
  title,
  data,
  xKey,
  dataKey,
  variant = "line",
  loading = false,
}) {
  const gradientId = `${dataKey}-fill`;

  return (
    <div className="min-w-0 rounded-lg border border-[#2C2F38] p-3 sm:p-5">
      <h2 className="mb-4 text-sm text-[#868C99]">{title}</h2>
      {loading ? (
        <div className="h-[220px] animate-pulse rounded-lg bg-[#1D1F26]" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          {variant === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2C2F38" vertical={false} />
              <XAxis
                dataKey={xKey}
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
                domain={[0, (max) => Math.max(max, 1)]}
              />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="#2DD4BF"
                fill={`url(#${gradientId})`}
                strokeWidth={2}
                dot={{ r: 3, fill: "#2DD4BF" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid stroke="#2C2F38" vertical={false} />
              <XAxis
                dataKey={xKey}
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
                domain={[0, (max) => Math.max(max, 1)]}
              />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#2DD4BF"
                strokeWidth={2}
                dot={{ r: 3, fill: "#2DD4BF" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}
