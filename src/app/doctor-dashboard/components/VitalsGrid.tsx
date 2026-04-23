'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Heart, Wind, Thermometer, Activity } from 'lucide-react';
import VitalSparkline from '@/components/VitalSparkline';
import {
  getHeartRateStatus,
  getSpo2Status,
  getTemperatureStatus,
  getSystolicStatus,
  type Patient,
  type AlertSeverity,
} from '@/lib/vitals';

interface VitalsGridProps {
  patient: Patient;
}

interface VitalCardProps {
  label: string;
  value: string;
  unit: string;
  subValue?: string;
  icon: React.ReactNode;
  status: AlertSeverity;
  sparkData: number[];
  thresholdNote: string;
  animateHeart?: boolean;
}

const STATUS_STYLES: Record<AlertSeverity, { bg: string; border: string; valueColor: string; iconBg: string }> = {
  critical: {
    bg: 'hsl(0 84% 60% / 0.08)',
    border: 'hsl(0 84% 60% / 0.45)',
    valueColor: 'hsl(0 84% 65%)',
    iconBg: 'hsl(0 84% 60% / 0.15)',
  },
  warning: {
    bg: 'hsl(38 92% 50% / 0.07)',
    border: 'hsl(38 92% 50% / 0.4)',
    valueColor: 'hsl(38 92% 60%)',
    iconBg: 'hsl(38 92% 50% / 0.15)',
  },
  normal: {
    bg: 'hsl(222 47% 11%)',
    border: 'hsl(222 30% 18%)',
    valueColor: 'hsl(142 71% 55%)',
    iconBg: 'hsl(142 71% 45% / 0.12)',
  },
};

function VitalCard({
  label,
  value,
  unit,
  subValue,
  icon,
  status,
  sparkData,
  thresholdNote,
  animateHeart = false,
}: VitalCardProps) {
  const styles = STATUS_STYLES[status];
  const prevValueRef = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setFlash(true);
      prevValueRef.current = value;
      const t = setTimeout(() => setFlash(false), 400);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div
      className="rounded-xl p-4 border transition-all duration-300 flex flex-col gap-3"
      style={{
        background: styles.bg,
        borderColor: styles.border,
        boxShadow: status !== 'normal' ? `0 0 20px ${status === 'critical' ? 'hsl(0 84% 60% / 0.1)' : 'hsl(38 92% 50% / 0.08)'}` : 'none',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'hsl(215 15% 50%)' }}>
            {label}
          </p>
          <div className="flex items-end gap-1.5">
            <span
              className={`font-mono text-2xl font-bold tabular-nums transition-all rounded ${flash ? 'value-flash' : ''}`}
              style={{ color: styles.valueColor }}
            >
              {value}
            </span>
            <span className="text-sm mb-0.5 font-medium" style={{ color: 'hsl(215 20% 50%)' }}>
              {unit}
            </span>
          </div>
          {subValue && (
            <p className="text-xs font-mono mt-0.5" style={{ color: 'hsl(215 20% 55%)' }}>
              {subValue}
            </p>
          )}
        </div>
        <div
          className="p-2 rounded-lg flex-shrink-0"
          style={{ background: styles.iconBg }}
        >
          <div className={animateHeart && status === 'critical' ? 'heartbeat' : ''}>
            {icon}
          </div>
        </div>
      </div>

      <div className="h-10">
        <VitalSparkline data={sparkData} severity={status} height={40} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'hsl(215 15% 40%)' }}>
          {thresholdNote}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
          style={{
            background:
              status === 'critical' ?'hsl(0 84% 60% / 0.2)'
                : status === 'warning' ?'hsl(38 92% 50% / 0.15)' :'hsl(142 71% 45% / 0.1)',
            color:
              status === 'critical' ?'hsl(0 84% 65%)'
                : status === 'warning' ?'hsl(38 92% 60%)' :'hsl(142 71% 55%)',
          }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

export default function VitalsGrid({ patient }: VitalsGridProps) {
  const r = patient.lastReading;
  const hist = patient.history;

  if (!r || !patient.connected) {
    return (
      <div
        className="rounded-xl border p-12 flex flex-col items-center justify-center gap-3"
        style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}
      >
        <Activity size={32} style={{ color: 'hsl(215 15% 45%)' }} />
        <p className="text-sm font-medium" style={{ color: 'hsl(215 20% 55%)' }}>
          Device Offline
        </p>
        <p className="text-xs text-center max-w-xs" style={{ color: 'hsl(215 15% 40%)' }}>
          No live vitals available for {patient.name}. The wearable device is not transmitting data.
        </p>
      </div>
    );
  }

  const hrStatus = getHeartRateStatus(r.heartRate);
  const spo2Status = getSpo2Status(r.spo2);
  const tempStatus = getTemperatureStatus(r.temperature);
  const bpStatus = getSystolicStatus(r.systolic);

  const sparkHR = hist.map((h) => h.heartRate);
  const sparkSpo2 = hist.map((h) => h.spo2);
  const sparkTemp = hist.map((h) => h.temperature);
  const sparkSys = hist.map((h) => h.systolic);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      <VitalCard
        label="Heart Rate"
        value={String(r.heartRate)}
        unit="BPM"
        icon={<Heart size={18} style={{ color: 'hsl(0 84% 65%)' }} />}
        status={hrStatus}
        sparkData={sparkHR}
        thresholdNote="Normal: 50–110 BPM"
        animateHeart
      />
      <VitalCard
        label="SpO₂"
        value={String(r.spo2)}
        unit="%"
        icon={<Wind size={18} style={{ color: 'hsl(199 89% 65%)' }} />}
        status={spo2Status}
        sparkData={sparkSpo2}
        thresholdNote="Normal: ≥94%"
      />
      <VitalCard
        label="Temperature"
        value={String(r.temperature)}
        unit="°C"
        icon={<Thermometer size={18} style={{ color: 'hsl(38 92% 60%)' }} />}
        status={tempStatus}
        sparkData={sparkTemp}
        thresholdNote="Normal: 35.5–38.5°C"
      />
      <VitalCard
        label="Blood Pressure"
        value={String(r.systolic)}
        unit="mmHg"
        subValue={`/ ${r.diastolic} diastolic`}
        icon={<Activity size={18} style={{ color: 'hsl(270 70% 65%)' }} />}
        status={bpStatus}
        sparkData={sparkSys}
        thresholdNote="Normal systolic: <140"
      />
    </div>
  );
}