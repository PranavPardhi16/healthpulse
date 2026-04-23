'use client';
import React from 'react';
import { Send, CheckCircle } from 'lucide-react';
import {
  getOverallStatus,
  type VitalReading,
} from '@/lib/vitals';

interface TransmissionLogProps {
  readings: VitalReading[];
}

export default function TransmissionLog({ readings }: TransmissionLogProps) {
  const rows = [...readings].reverse().slice(0, 30);

  if (rows.length === 0) {
    return (
      <div
        className="rounded-xl border p-12 flex flex-col items-center justify-center gap-3"
        style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}
      >
        <Send size={28} style={{ color: 'hsl(215 15% 45%)' }} />
        <p className="text-sm font-medium" style={{ color: 'hsl(210 40% 75%)' }}>
          No transmissions yet
        </p>
        <p className="text-xs text-center" style={{ color: 'hsl(215 15% 45%)' }}>
          Connect your device to start transmitting vitals to your care team.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}
    >
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'hsl(222 30% 14%)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'hsl(210 40% 96%)' }}>
          Transmission Log
        </h3>
        <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
          {rows.length} entries
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid hsl(222 30% 14%)' }}>
              {['Time', 'HR', 'SpO₂', 'Temp', 'BP', 'Status', 'Delivered'].map((h) => (
                <th
                  key={`tl-th-${h}`}
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'hsl(215 15% 45%)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const status = getOverallStatus(r);
              return (
                <tr
                  key={r.id}
                  style={{
                    background: i % 2 === 0 ? 'transparent' : 'hsl(222 47% 10%)',
                    borderBottom: '1px solid hsl(222 30% 12%)',
                  }}
                >
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: 'hsl(215 20% 55%)' }}>
                    {new Date(r.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs font-medium" style={{ color: 'hsl(210 40% 88%)' }}>
                    {r.heartRate}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs font-medium" style={{ color: 'hsl(210 40% 88%)' }}>
                    {r.spo2}%
                  </td>
                  <td className="px-4 py-2 font-mono text-xs font-medium" style={{ color: 'hsl(210 40% 88%)' }}>
                    {r.temperature}°C
                  </td>
                  <td className="px-4 py-2 font-mono text-xs font-medium" style={{ color: 'hsl(210 40% 88%)' }}>
                    {r.systolic}/{r.diastolic}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          status === 'critical' ?'hsl(0 84% 60% / 0.15)'
                            : status === 'warning' ?'hsl(38 92% 50% / 0.12)' :'hsl(142 71% 45% / 0.1)',
                        color:
                          status === 'critical' ?'hsl(0 84% 65%)'
                            : status === 'warning' ?'hsl(38 92% 60%)' :'hsl(142 71% 55%)',
                      }}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <CheckCircle size={13} style={{ color: 'hsl(142 71% 45%)' }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}