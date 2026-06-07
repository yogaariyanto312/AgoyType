"use client";

import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { RawDataPoint } from "@/lib/stats";

interface ResultChartProps {
  rawData: RawDataPoint[];
}

export function ResultChart({ rawData }: ResultChartProps) {
  // derive per-second error markers (only where a new error occurred)
  const data = rawData.map((d, i) => {
    const prevErrors = i > 0 ? rawData[i - 1].errors : 0;
    const newErrors = d.errors - prevErrors;
    return {
      t: d.t,
      wpm: d.wpm,
      raw: d.raw,
      errorMark: newErrors > 0 ? d.raw : null,
    };
  });

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="t"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
            unit="s"
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              color: "hsl(var(--popover-foreground))",
              fontSize: 12,
            }}
            labelFormatter={(v) => `${v}s`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="wpm"
            name="wpm"
            stroke="hsl(var(--tt-main))"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="raw"
            name="raw"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={false}
          />
          <Scatter
            dataKey="errorMark"
            name="errors"
            fill="hsl(var(--tt-error))"
            shape="cross"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
