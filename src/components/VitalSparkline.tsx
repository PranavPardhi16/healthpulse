'use client';
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import type { AlertSeverity } from '@/lib/vitals';

interface SparklineProps {
  data: number[];
  severity: AlertSeverity;
  height?: number;
}

const COLORS: Record<AlertSeverity, string> = {
  normal: 'hsl(142 71% 45%)',
  warning: 'hsl(38 92% 50%)',
  critical: 'hsl(0 84% 60%)',
};

export default function VitalSparkline({ data, severity, height = 40 }: SparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }));
  const color = COLORS[severity];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-grad-${severity}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-grad-${severity})`}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <div
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: 'hsl(222 47% 12%)',
                  border: '1px solid hsl(222 30% 18%)',
                  color: 'hsl(210 40% 96%)',
                }}
              >
                {payload[0].value}
              </div>
            ) : null
          }
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}