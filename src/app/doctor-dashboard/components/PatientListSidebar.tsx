'use client';
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import {
  getOverallStatus,
  type Patient,
} from '@/lib/vitals';

interface PatientListSidebarProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
}

const STATUS_COLORS = {
  critical: { bg: 'hsl(0 84% 60% / 0.12)', border: 'hsl(0 84% 60% / 0.4)', dot: 'hsl(0 84% 60%)' },
  warning: { bg: 'hsl(38 92% 50% / 0.1)', border: 'hsl(38 92% 50% / 0.35)', dot: 'hsl(38 92% 55%)' },
  normal: { bg: 'transparent', border: 'hsl(222 30% 18%)', dot: 'hsl(142 71% 45%)' },
};

export default function PatientListSidebar({
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientListSidebarProps) {
  return (
    <aside
      className="hidden md:flex flex-col w-56 xl:w-64 flex-shrink-0 border-r overflow-y-auto"
      style={{
        background: 'hsl(222 47% 8%)',
        borderColor: 'hsl(222 30% 14%)',
      }}
    >
      <div
        className="px-3 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'hsl(222 30% 14%)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(215 15% 45%)' }}>
          Patients
        </span>
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded"
          style={{ background: 'hsl(222 47% 15%)', color: 'hsl(215 20% 65%)' }}
        >
          {patients.length}
        </span>
      </div>

      <div className="flex-1 py-2 space-y-1 px-2">
        {patients.map((patient) => {
          const status = patient.connected && patient.lastReading
            ? getOverallStatus(patient.lastReading)
            : 'normal';
          const colors = STATUS_COLORS[status];
          const isSelected = patient.id === selectedPatientId;

          return (
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className="w-full text-left rounded-lg p-2.5 transition-all duration-150 border"
              style={{
                background: isSelected ? 'hsl(199 89% 48% / 0.12)' : colors.bg,
                borderColor: isSelected ? 'hsl(199 89% 48% / 0.35)' : colors.border,
              }}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: patient.connected ? colors.dot : 'hsl(215 15% 45%)',
                        boxShadow: patient.connected ? `0 0 5px ${colors.dot}` : 'none',
                      }}
                    />
                    <span
                      className="text-xs font-semibold truncate"
                      style={{ color: isSelected ? 'hsl(199 89% 75%)' : 'hsl(210 40% 88%)' }}
                    >
                      {patient.name.split(' ')[0]} {patient.name.split(' ')[1]?.charAt(0)}.
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'hsl(215 15% 45%)' }}>
                    {patient.ward}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {patient.connected ? (
                    <Wifi size={11} style={{ color: 'hsl(142 71% 45%)' }} />
                  ) : (
                    <WifiOff size={11} style={{ color: 'hsl(215 15% 45%)' }} />
                  )}
                </div>
              </div>

              {patient.connected && patient.lastReading && (
                <div
                  className="mt-2 grid grid-cols-2 gap-1"
                >
                  <div className="text-center">
                    <p className="font-mono text-xs font-semibold" style={{ color: 'hsl(210 40% 90%)' }}>
                      {patient.lastReading.heartRate}
                    </p>
                    <p className="text-xs" style={{ color: 'hsl(215 15% 40%)' }}>BPM</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-xs font-semibold" style={{ color: 'hsl(210 40% 90%)' }}>
                      {patient.lastReading.spo2}%
                    </p>
                    <p className="text-xs" style={{ color: 'hsl(215 15% 40%)' }}>SpO₂</p>
                  </div>
                </div>
              )}

              {!patient.connected && (
                <p className="text-xs mt-1" style={{ color: 'hsl(215 15% 40%)' }}>
                  Device offline
                </p>
              )}

              {status !== 'normal' && patient.connected && (
                <div
                  className="mt-2 text-center text-xs font-semibold uppercase tracking-wide rounded py-0.5"
                  style={{
                    background: status === 'critical' ? 'hsl(0 84% 60% / 0.2)' : 'hsl(38 92% 50% / 0.15)',
                    color: status === 'critical' ? 'hsl(0 84% 65%)' : 'hsl(38 92% 60%)',
                  }}
                >
                  {status}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}