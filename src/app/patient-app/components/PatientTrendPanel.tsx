'use client';
import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,  } from 'recharts';
import type { VitalReading } from '@/lib/vitals';

interface PatientTrendPanelProps {
  readings: VitalReading[];
}

type Metric = 'heartRate' | 'spo2' | 'temperature' | 'systolic';

const METRICS: Record<Metric, { label: string; unit: string; color: string; domain: [number, number] }> = {
  heartRate: { label: 'Heart Rate', unit: 'BPM', color: 'hsl(0 84% 60%)', domain: [40, 160] },
  spo2: { label: 'SpO₂', unit: '%', color: 'hsl(199 89% 48%)', domain: [82, 101] },
  temperature: { label: 'Temperature', unit: '°C', color: 'hsl(38 92% 50%)', domain: [34, 41] },
  systolic: { label: 'Systolic BP', unit: 'mmHg', color: 'hsl(270 70% 65%)', domain: [70, 190] },
};

const CustomTooltip = ({ active, payload, label, unit }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; unit: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: 'hsl(222 47% 14%)', border: '1px solid hsl(222 30% 22%)', color: 'hsl(210 40% 90%)' }}>
      <p style={{ color: 'hsl(215 15% 55%)' }} className="mb-1">{label}</p>
      <p className="font-mono font-semibold">{payload[0].value} {unit}</p>
    </div>
  );
};

export default function PatientTrendPanel({ readings }: PatientTrendPanelProps) {
  const [metric, setMetric] = useState<Metric>('heartRate');
  const config = METRICS[metric];

  if (readings.length === 0) {
    return (
      <div className="rounded-xl border p-12 flex flex-col items-center justify-center gap-3" style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}>
        <p className="text-sm" style={{ color: 'hsl(215 20% 55%)' }}>No readings yet — connect your device to see trends</p>
      </div>
    );
  }

  const data = readings.slice(-40).map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: r[metric],
  }));

  return (
    <div className="rounded-xl border p-4 lg:p-5" style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'hsl(210 40% 96%)' }}>My Vital Trends</h3>
          <p className="text-xs mt-0.5" style={{ color: 'hsl(215 15% 45%)' }}>Last {data.length} readings</p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(METRICS) as Metric[]).map((k) => (
            <button
              key={`pt-${k}`}
              onClick={() => setMetric(k)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: metric === k ? METRICS[k].color + '25' : 'hsl(222 47% 14%)',
                color: metric === k ? METRICS[k].color : 'hsl(215 20% 55%)',
                border: `1px solid ${metric === k ? METRICS[k].color + '50' : 'hsl(222 30% 20%)'}`,
              }}
            >
              {METRICS[k].label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="ptGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215 15% 40%)', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={Math.floor(data.length / 5)} />
          <YAxis domain={config.domain} tick={{ fontSize: 10, fill: 'hsl(215 15% 40%)', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} width={36} />
          <Tooltip content={<CustomTooltip unit={config.unit} />} />
          <Area type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} fill="url(#ptGrad)" dot={false} activeDot={{ r: 4, fill: config.color, strokeWidth: 0 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}