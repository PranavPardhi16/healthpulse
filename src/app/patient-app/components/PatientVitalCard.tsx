'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Heart, Wind, Thermometer, Activity } from 'lucide-react';
import {
  getHeartRateStatus,
  getSpo2Status,
  getTemperatureStatus,
  getSystolicStatus,
  type VitalReading,
  type AlertSeverity,
} from '@/lib/vitals';

interface PatientVitalCardProps {
  reading: VitalReading | null;
  connected: boolean;
  transmitCount: number;
}

const STATUS_STYLES: Record<AlertSeverity, { bg: string; border: string; value: string; glow: string }> = {
  critical: {
    bg: 'hsl(0 84% 60% / 0.08)',
    border: 'hsl(0 84% 60% / 0.45)',
    value: 'hsl(0 84% 65%)',
    glow: '0 0 24px hsl(0 84% 60% / 0.2)',
  },
  warning: {
    bg: 'hsl(38 92% 50% / 0.07)',
    border: 'hsl(38 92% 50% / 0.4)',
    value: 'hsl(38 92% 60%)',
    glow: '0 0 20px hsl(38 92% 50% / 0.15)',
  },
  normal: {
    bg: 'hsl(222 47% 11%)',
    border: 'hsl(222 30% 20%)',
    value: 'hsl(142 71% 55%)',
    glow: 'none',
  },
};

function BigVitalCard({
  label,
  value,
  unit,
  sub,
  icon,
  status,
  isHeart,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  icon: React.ReactNode;
  status: AlertSeverity;
  isHeart?: boolean;
}) {
  const styles = STATUS_STYLES[status];
  const prevRef = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlash(true);
      prevRef.current = value;
      const t = setTimeout(() => setFlash(false), 500);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300"
      style={{
        background: styles.bg,
        borderColor: styles.border,
        boxShadow: styles.glow,
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(215 15% 50%)' }}>
          {label}
        </p>
        <div
          className={isHeart && status !== 'normal' ? 'heartbeat' : ''}
          style={{ color: styles.value }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div className={`flex items-end gap-2 rounded-lg transition-all ${flash ? 'value-flash' : ''}`}>
          <span
            className="font-mono font-bold tabular-nums"
            style={{ fontSize: '2.5rem', lineHeight: 1, color: styles.value }}
          >
            {value}
          </span>
          <span className="font-medium mb-1" style={{ color: 'hsl(215 20% 50%)', fontSize: '1rem' }}>
            {unit}
          </span>
        </div>
        {sub && (
          <p className="font-mono text-sm mt-1" style={{ color: 'hsl(215 20% 55%)' }}>
            {sub}
          </p>
        )}
      </div>

      <div
        className="text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-lg text-center"
        style={{
          background:
            status === 'critical' ?'hsl(0 84% 60% / 0.15)'
              : status === 'warning' ?'hsl(38 92% 50% / 0.12)' :'hsl(142 71% 45% / 0.1)',
          color: styles.value,
        }}
      >
        {status}
      </div>
    </div>
  );
}

export default function PatientVitalCard({
  reading,
  connected,
  transmitCount,
}: PatientVitalCardProps) {
  if (!reading) {
    return (
      <div
        className="rounded-xl border p-8 flex items-center justify-center"
        style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}
      >
        <p className="text-sm" style={{ color: 'hsl(215 20% 55%)' }}>
          Waiting for first reading...
        </p>
      </div>
    );
  }

  const hrStatus = getHeartRateStatus(reading.heartRate);
  const spo2Status = getSpo2Status(reading.spo2);
  const tempStatus = getTemperatureStatus(reading.temperature);
  const bpStatus = getSystolicStatus(reading.systolic);

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div
        className="rounded-xl border px-4 py-2.5 flex items-center gap-3"
        style={{
          background: connected ? 'hsl(142 71% 45% / 0.06)' : 'hsl(222 47% 10%)',
          borderColor: connected ? 'hsl(142 71% 45% / 0.25)' : 'hsl(222 30% 18%)',
        }}
      >
        <div className="relative">
          {connected && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: 'hsl(142 71% 45%)',
                animation: 'pulse-ring 1.5s ease-out infinite',
                opacity: 0.3,
              }}
            />
          )}
          <span
            className="relative inline-block w-2.5 h-2.5 rounded-full"
            style={{
              background: connected ? 'hsl(142 71% 45%)' : 'hsl(215 15% 45%)',
              boxShadow: connected ? '0 0 8px hsl(142 71% 45%)' : 'none',
            }}
          />
        </div>
        <span className="text-sm font-medium" style={{ color: connected ? 'hsl(142 71% 55%)' : 'hsl(215 20% 55%)' }}>
          {connected ? 'Live — transmitting to care team' : 'Last recorded reading'}
        </span>
        <span className="ml-auto font-mono text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
          #{transmitCount} readings
        </span>
        <span className="font-mono text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
          {new Date(reading.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
        </span>
      </div>

      {/* Vital cards grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <BigVitalCard
          label="Heart Rate"
          value={String(reading.heartRate)}
          unit="BPM"
          icon={<Heart size={20} />}
          status={hrStatus}
          isHeart
        />
        <BigVitalCard
          label="SpO₂"
          value={String(reading.spo2)}
          unit="%"
          icon={<Wind size={20} />}
          status={spo2Status}
        />
        <BigVitalCard
          label="Temperature"
          value={String(reading.temperature)}
          unit="°C"
          icon={<Thermometer size={20} />}
          status={tempStatus}
        />
        <BigVitalCard
          label="Blood Pressure"
          value={String(reading.systolic)}
          unit="mmHg"
          sub={`/ ${reading.diastolic} diastolic`}
          icon={<Activity size={20} />}
          status={bpStatus}
        />
      </div>
    </div>
  );
}