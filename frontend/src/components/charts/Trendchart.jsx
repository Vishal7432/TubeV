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
}) {
  const gradientId = `${dataKey}-fill`;

  return (
    <div className="border border-[#2C2F38] rounded-lg p-5">
      <h2 className="text-sm text-[#868C99] mb-4">{title}</h2>
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
            />
            <Tooltip {...tooltipStyle} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#2DD4BF"
              fill={`url(#${gradientId})`}
              strokeWidth={2}
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
            />
            <Tooltip {...tooltipStyle} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#2DD4BF"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
