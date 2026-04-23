'use client';
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { Patient } from '@/lib/vitals';

interface VitalTrendChartProps {
  patient: Patient;
}

type MetricKey = 'heartRate' | 'spo2' | 'temperature' | 'systolic';

const METRIC_CONFIG: Record<
  MetricKey,
  {
    label: string;
    unit: string;
    color: string;
    domain: [number, number];
    warningHigh?: number;
    warningLow?: number;
    criticalHigh?: number;
    criticalLow?: number;
  }
> = {
  heartRate: {
    label: 'Heart Rate',
    unit: 'BPM',
    color: 'hsl(0 84% 60%)',
    domain: [30, 160],
    warningLow: 50,
    warningHigh: 110,
    criticalLow: 40,
    criticalHigh: 130,
  },
  spo2: {
    label: 'SpO₂',
    unit: '%',
    color: 'hsl(199 89% 48%)',
    domain: [80, 102],
    criticalLow: 90,
    warningLow: 94,
  },
  temperature: {
    label: 'Temperature',
    unit: '°C',
    color: 'hsl(38 92% 50%)',
    domain: [33, 42],
    criticalLow: 35,
    warningLow: 35.5,
    warningHigh: 38.5,
    criticalHigh: 39.5,
  },
  systolic: {
    label: 'Systolic BP',
    unit: 'mmHg',
    color: 'hsl(270 70% 65%)',
    domain: [60, 200],
    warningHigh: 140,
    criticalHigh: 160,
  },
};

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  unit: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{
        background: 'hsl(222 47% 14%)',
        border: '1px solid hsl(222 30% 22%)',
        color: 'hsl(210 40% 90%)',
      }}
    >
      <p style={{ color: 'hsl(215 15% 55%)' }} className="mb-1">{label}</p>
      {payload.map((p) => (
        <p key={`tip-${p.name}`} className="font-mono font-semibold">
          {p.value} {unit}
        </p>
      ))}
    </div>
  );
};

export default function VitalTrendChart({ patient }: VitalTrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('heartRate');
  const config = METRIC_CONFIG[activeMetric];

  const chartData = patient.history.slice(-30).map((r, i) => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    value: r[activeMetric],
    index: i,
  }));

  if (!patient.connected || patient.history.length === 0) {
    return (
      <div
        className="rounded-xl border p-12 flex items-center justify-center"
        style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}
      >
        <p className="text-sm" style={{ color: 'hsl(215 20% 55%)' }}>
          No trend data available — device offline
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border p-4 lg:p-5"
      style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}
    >
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'hsl(210 40% 96%)' }}>
            Vital Trend — {config.label}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'hsl(215 15% 45%)' }}>
            Last {chartData.length} readings · {patient.name}
          </p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => (
            <button
              key={`metric-btn-${key}`}
              onClick={() => setActiveMetric(key)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background:
                  activeMetric === key
                    ? METRIC_CONFIG[key].color + '25' :'hsl(222 47% 14%)',
                color: activeMetric === key ? METRIC_CONFIG[key].color : 'hsl(215 20% 55%)',
                border: `1px solid ${activeMetric === key ? METRIC_CONFIG[key].color + '50' : 'hsl(222 30% 20%)'}`,
              }}
            >
              {METRIC_CONFIG[key].label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(222 30% 16%)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'hsl(215 15% 40%)', fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(chartData.length / 5)}
          />
          <YAxis
            domain={config.domain}
            tick={{ fontSize: 10, fill: 'hsl(215 15% 40%)', fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip unit={config.unit} />} />

          {config.warningHigh !== undefined && (
            <ReferenceLine
              y={config.warningHigh}
              stroke="hsl(38 92% 50%)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'Warn ↑', fill: 'hsl(38 92% 55%)', fontSize: 9, position: 'right' }}
            />
          )}
          {config.criticalHigh !== undefined && (
            <ReferenceLine
              y={config.criticalHigh}
              stroke="hsl(0 84% 60%)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'Crit ↑', fill: 'hsl(0 84% 65%)', fontSize: 9, position: 'right' }}
            />
          )}
          {config.warningLow !== undefined && (
            <ReferenceLine
              y={config.warningLow}
              stroke="hsl(38 92% 50%)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'Warn ↓', fill: 'hsl(38 92% 55%)', fontSize: 9, position: 'right' }}
            />
          )}
          {config.criticalLow !== undefined && (
            <ReferenceLine
              y={config.criticalLow}
              stroke="hsl(0 84% 60%)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'Crit ↓', fill: 'hsl(0 84% 65%)', fontSize: 9, position: 'right' }}
            />
          )}

          <Area
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={2}
            fill="url(#trendGrad)"
            dot={false}
            activeDot={{ r: 4, fill: config.color, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend / threshold key */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5" style={{ background: 'hsl(0 84% 60%)', borderTop: '1px dashed' }} />
          <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>Critical threshold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5" style={{ background: 'hsl(38 92% 50%)', borderTop: '1px dashed' }} />
          <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>Warning threshold</span>
        </div>
      </div>
    </div>
  );
}