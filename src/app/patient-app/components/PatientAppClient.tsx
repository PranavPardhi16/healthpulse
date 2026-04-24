'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Wifi, WifiOff, Power, LogOut, AlertTriangle, BarChart2, List, Stethoscope,  } from 'lucide-react';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';
import { generateVitalReading, checkAlerts, getOverallStatus, type VitalReading, type Alert,  } from '@/lib/vitals';
import PatientVitalCard from './PatientVitalCard';
import PatientTrendPanel from './PatientTrendPanel';
import TransmissionLog from './TransmissionLog';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';


let readingSeq = 0;

export default function PatientAppClient() {
  const { data: session } = useSession();
  const [connected, setConnected] = useState(false);
  const [readings, setReadings] = useState<VitalReading[]>([]);
  const [currentReading, setCurrentReading] = useState<VitalReading | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [transmitCount, setTransmitCount] = useState(0);
  const [activeView, setActiveView] = useState<'vitals' | 'trends' | 'log'>('vitals');
  const [connecting, setConnecting] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const PATIENT_PROFILE = {
    id: 'patient-self',
    name: session?.user?.name || 'Sarah Chen',
    age: 34,
    patientId: session?.user?.email || 'HP-2024-0892',
    doctor: 'Dr. Kavya Reddy',
    ward: 'Remote Monitoring',
    condition: 'Hypertension Management',
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const update = () => {
      setTimeStr(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const sendReading = useCallback(() => {
    readingSeq++;
    const seq = readingSeq;
    // Backend integration point: socket.emit('vital-reading', { patientId: PATIENT_PROFILE.id, reading })
    const reading = generateVitalReading(seq, 'normal');
    reading.id = `self-reading-${seq}`;
    reading.timestamp = Date.now();

    setCurrentReading(reading);
    setReadings((prev) => [...prev, reading].slice(-100));
    setTransmitCount((c) => c + 1);

    const newAlerts = checkAlerts(reading, PATIENT_PROFILE.id, PATIENT_PROFILE.name);
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50));
      newAlerts.forEach((a) => {
        if (a.severity === 'critical') {
          toast.error(`⚠️ ${a.message}`, { duration: 5000 });
        } else {
          toast.warning(`${a.message}`, { duration: 3000 });
        }
      });
    }
  }, []);

  const handleConnect = useCallback(() => {
    if (connected) {
      // Backend integration point: socket.disconnect()
      if (intervalRef.current) clearInterval(intervalRef.current);
      setConnected(false);
      toast.info('Device disconnected from HealthPulse');
      return;
    }

    setConnecting(true);
    // Backend integration point: socket.connect() then socket.emit('patient-connect', { patientId })
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      toast.success('Device connected — transmitting vitals every 3 seconds');
      sendReading();
      intervalRef.current = setInterval(sendReading, 3000);
    }, 1500);
  }, [connected, sendReading]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const overallStatus = currentReading ? getOverallStatus(currentReading) : 'normal';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'hsl(222 47% 6%)' }}
    >
      {/* Top bar */}
      <header
        className="flex items-center gap-3 px-4 lg:px-8 py-3 border-b flex-shrink-0"
        style={{ background: 'hsl(222 47% 8%)', borderColor: 'hsl(222 30% 14%)' }}
      >
        <div className="flex items-center gap-2">
          <AppLogo size={28} />
          <span className="font-semibold text-sm" style={{ color: 'hsl(210 40% 96%)' }}>
            HealthPulse
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'hsl(199 89% 48% / 0.15)', color: 'hsl(199 89% 65%)' }}
          >
            Patient
          </span>
        </div>
        <div className="flex-1" />
        <span className="font-mono text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
          {timeStr}
        </span>
        <a
          href="/doctor-dashboard"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'hsl(222 47% 14%)', color: 'hsl(215 20% 65%)' }}
        >
          <Stethoscope size={13} />
          <span className="hidden sm:inline">Doctor View</span>
        </a>
        <button
          onClick={() => signOut({ callbackUrl: '/' })} // This destroys the session!
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'hsl(215 20% 55%)' }}
        >
          <LogOut size={16} />
        </button>
      </header>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 lg:px-8 xl:px-12 py-6 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Left: Patient info + connection control */}
        <aside className="lg:col-span-1 flex flex-col gap-4">
          {/* Patient card */}
          <div
            className="rounded-xl border p-4"
            style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'hsl(199 89% 30%)', color: 'hsl(199 89% 85%)' }}
              >
                {getInitials(PATIENT_PROFILE.name)}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'hsl(210 40% 96%)' }}>
                  {PATIENT_PROFILE.name}
                </p>
                <p className="text-xs font-mono" style={{ color: 'hsl(215 15% 45%)' }}>
                  {PATIENT_PROFILE.patientId}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Age', value: `${PATIENT_PROFILE.age} years` },
                { label: 'Condition', value: PATIENT_PROFILE.condition },
                { label: 'Assigned Doctor', value: PATIENT_PROFILE.doctor },
                { label: 'Program', value: PATIENT_PROFILE.ward },
              ].map((item) => (
                <div key={`info-${item.label}`} className="flex justify-between gap-2">
                  <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
                    {item.label}
                  </span>
                  <span className="text-xs font-medium text-right" style={{ color: 'hsl(210 40% 80%)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Connection control */}
          <div
            className="rounded-xl border p-4"
            style={{
              background: connected ? 'hsl(142 71% 45% / 0.06)' : 'hsl(222 47% 9%)',
              borderColor: connected ? 'hsl(142 71% 45% / 0.3)' : 'hsl(222 30% 18%)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                {connected && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'hsl(142 71% 45%)',
                      animation: 'pulse-ring 1.5s ease-out infinite',
                      opacity: 0.4,
                    }}
                  />
                )}
                {connected ? (
                  <Wifi size={18} style={{ color: 'hsl(142 71% 55%)' }} />
                ) : (
                  <WifiOff size={18} style={{ color: 'hsl(215 15% 45%)' }} />
                )}
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: connected ? 'hsl(142 71% 55%)' : 'hsl(215 20% 55%)' }}
              >
                {connected ? 'Transmitting' : 'Disconnected'}
              </span>
            </div>

            {connected && (
              <div className="mb-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>Readings sent</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: 'hsl(142 71% 55%)' }}>
                    {transmitCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>Interval</span>
                  <span className="font-mono text-xs" style={{ color: 'hsl(210 40% 75%)' }}>3s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>Overall status</span>
                  <span
                    className="text-xs font-semibold uppercase"
                    style={{
                      color:
                        overallStatus === 'critical' ?'hsl(0 84% 65%)'
                          : overallStatus === 'warning' ?'hsl(38 92% 60%)' :'hsl(142 71% 55%)',
                    }}
                  >
                    {overallStatus}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 active:scale-95 disabled:opacity-60"
              style={{
                background: connected
                  ? 'hsl(0 84% 60% / 0.15)'
                  : connecting
                  ? 'hsl(199 89% 48% / 0.2)'
                  : 'hsl(142 71% 45%)',
                color: connected
                  ? 'hsl(0 84% 65%)'
                  : connecting
                  ? 'hsl(199 89% 65%)'
                  : 'hsl(142 10% 10%)',
                border: connected ? '1px solid hsl(0 84% 60% / 0.3)' : 'none',
              }}
            >
              {connecting ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'hsl(199 89% 65%) transparent hsl(199 89% 65%) transparent' }} />
                  Connecting...
                </>
              ) : connected ? (
                <>
                  <Power size={15} />
                  Disconnect Device
                </>
              ) : (
                <>
                  <Power size={15} />
                  Connect Device
                </>
              )}
            </button>

            {!connected && (
              <p className="text-xs text-center mt-2" style={{ color: 'hsl(215 15% 40%)' }}>
                Simulates wearable transmitting vitals every 3 seconds
              </p>
            )}
          </div>

          {/* Active alerts */}
          {alerts.filter((a) => !a.acknowledged).length > 0 && (
            <div
              className="rounded-xl border p-3"
              style={{ background: 'hsl(0 84% 60% / 0.06)', borderColor: 'hsl(0 84% 60% / 0.3)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={13} style={{ color: 'hsl(0 84% 65%)' }} />
                <span className="text-xs font-semibold" style={{ color: 'hsl(0 84% 65%)' }}>
                  {alerts.filter((a) => !a.acknowledged).length} Active Alert
                  {alerts.filter((a) => !a.acknowledged).length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-1.5">
                {alerts
                  .filter((a) => !a.acknowledged)
                  .slice(0, 3)
                  .map((a) => (
                    <p key={a.id} className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>
                      · {a.message}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main: vitals + view */}
        <main className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4">
          {/* View selector */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold" style={{ color: 'hsl(210 40% 96%)' }}>
              My Vitals
            </h1>
            <div
              className="flex rounded-lg p-1 gap-1"
              style={{ background: 'hsl(222 47% 9%)' }}
            >
              {([
                { key: 'vitals', icon: Activity, label: 'Live' },
                { key: 'trends', icon: BarChart2, label: 'Trends' },
                { key: 'log', icon: List, label: 'Log' },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={`view-${key}`}
                  onClick={() => setActiveView(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
                  style={{
                    background: activeView === key ? 'hsl(222 47% 16%)' : 'transparent',
                    color: activeView === key ? 'hsl(210 40% 96%)' : 'hsl(215 20% 55%)',
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeView === 'vitals' && (
            <div className="fade-in">
              {!connected && !currentReading ? (
                <div
                  className="rounded-xl border p-12 flex flex-col items-center justify-center gap-4"
                  style={{ background: 'hsl(222 47% 9%)', borderColor: 'hsl(222 30% 18%)' }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(222 47% 14%)' }}
                  >
                    <WifiOff size={28} style={{ color: 'hsl(215 15% 45%)' }} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold mb-1" style={{ color: 'hsl(210 40% 80%)' }}>
                      No vitals data yet
                    </p>
                    <p className="text-sm" style={{ color: 'hsl(215 15% 45%)' }}>
                      Connect your device to start streaming vitals to your care team.
                    </p>
                  </div>
                </div>
              ) : (
                <PatientVitalCard reading={currentReading} connected={connected} transmitCount={transmitCount} />
              )}
            </div>
          )}

          {activeView === 'trends' && (
            <div className="fade-in">
              <PatientTrendPanel readings={readings} />
            </div>
          )}

          {activeView === 'log' && (
            <div className="fade-in">
              <TransmissionLog readings={readings} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}