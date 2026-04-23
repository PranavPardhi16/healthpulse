'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Bell, Users, LogOut, Menu, LayoutDashboard, Stethoscope, FileText, Settings,  } from 'lucide-react';
import { MOCK_PATIENTS, generateVitalReading, checkAlerts, getOverallStatus, type Patient, type Alert, type VitalReading,  } from '@/lib/vitals';
import PatientListSidebar from './PatientListSidebar';
import VitalsGrid from './VitalsGrid';
import AlertFeed from './AlertFeed';
import VitalTrendChart from './VitalTrendChart';
import DoctorHeader from './DoctorHeader';
import AppLogo from '@/components/ui/AppLogo';

const SCENARIO_MAP: Record<string, 'normal' | 'warning' | 'critical'> = {
  'patient-001': 'warning',
  'patient-002': 'critical',
  'patient-003': 'normal',
  'patient-004': 'warning',
  'patient-005': 'normal',
  'patient-006': 'normal',
};

const MAX_HISTORY = 1000;
let readingCounter = 1000;

export default function DoctorDashboardClient() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('patient-001');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'vitals' | 'trends' | 'history'>('vitals');
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const prevAlertsRef = useRef<Set<string>>(new Set());

  // Backend integration point: replace this interval with Socket.io event listener
  // socket.on('vital-reading', (data: { patientId: string; reading: VitalReading }) => { ... })
  useEffect(() => {
    const interval = setInterval(() => {
      readingCounter++;
      const counter = readingCounter;

      setPatients((prev) =>
        prev.map((p) => {
          if (!p.connected) return p;
          const scenario = SCENARIO_MAP[p.id] ?? 'normal';
          const reading = generateVitalReading(counter, scenario);
          reading.id = `reading-${p.id}-${counter}`;
          reading.timestamp = Date.now();

          const newHistory = [...p.history, reading].slice(-MAX_HISTORY);
          return { ...p, lastReading: reading, history: newHistory };
        })
      );

      setLastUpdateTime(Date.now());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Alert generation
  useEffect(() => {
    const newAlerts: Alert[] = [];
    patients.forEach((p) => {
      if (!p.connected || !p.lastReading) return;
      const generated = checkAlerts(p.lastReading, p.id, p.name);
      generated.forEach((a) => {
        if (!prevAlertsRef.current.has(a.id)) {
          newAlerts.push(a);
        }
      });
    });

    if (newAlerts.length > 0) {
      newAlerts.forEach((a) => {
        prevAlertsRef.current.add(a.id);
        if (a.severity === 'critical') {
          toast.error(`🚨 ${a.patientName}: ${a.message}`, { duration: 6000 });
        }
      });
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 200));
    }
  }, [patients]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    toast.success('Alert acknowledged');
  }, []);

  const acknowledgeAll = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    toast.success('All alerts acknowledged');
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? patients[0];

  const connectedCount = patients.filter((p) => p.connected).length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length;

  const navItems = [
    { id: 'nav-dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
    { id: 'nav-patients', icon: Users, label: 'Patients', active: false },
    { id: 'nav-alerts', icon: Bell, label: 'Alerts', badge: activeAlerts.length, active: false },
    { id: 'nav-reports', icon: FileText, label: 'Reports', active: false },
    { id: 'nav-settings', icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(222 47% 6%)' }}>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300
          lg:relative lg:flex
          ${sidebarOpen ? 'w-60' : 'w-16'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'hsl(222 47% 8%)',
          borderRight: '1px solid hsl(222 30% 14%)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-4 border-b"
          style={{ borderColor: 'hsl(222 30% 14%)' }}
        >
          <AppLogo size={32} />
          {sidebarOpen && (
            <span className="font-semibold text-sm tracking-tight" style={{ color: 'hsl(210 40% 96%)' }}>
              HealthPulse
            </span>
          )}
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="ml-auto hidden lg:flex items-center justify-center w-6 h-6 rounded transition-colors"
            style={{ color: 'hsl(215 15% 45%)' }}
          >
            <Menu size={14} />
          </button>
        </div>

        {/* Doctor info */}
        {sidebarOpen && (
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: 'hsl(222 30% 14%)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'hsl(199 89% 30%)', color: 'hsl(199 89% 85%)' }}
              >
                DK
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'hsl(210 40% 96%)' }}>
                  Dr. Kavya Reddy
                </p>
                <p className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
                  Cardiology
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left
                ${item.active ? 'text-white' : ''}
              `}
              style={{
                background: item.active ? 'hsl(199 89% 48% / 0.15)' : 'transparent',
                color: item.active ? 'hsl(199 89% 65%)' : 'hsl(215 20% 55%)',
                border: item.active ? '1px solid hsl(199 89% 48% / 0.25)' : '1px solid transparent',
              }}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                      style={{ background: 'hsl(0 84% 60% / 0.2)', color: 'hsl(0 84% 70%)' }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div
          className="px-2 py-3 border-t space-y-1"
          style={{ borderColor: 'hsl(222 30% 14%)' }}
        >
          <a
            href="/patient-app"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
            style={{ color: 'hsl(215 20% 55%)' }}
          >
            <Stethoscope size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Patient View</span>}
          </a>
          <a
            href="/sign-up-login"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
            style={{ color: 'hsl(215 20% 55%)' }}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <DoctorHeader
          connectedCount={connectedCount}
          totalPatients={patients.length}
          activeAlerts={activeAlerts.length}
          criticalCount={criticalCount}
          lastUpdateTime={lastUpdateTime}
          onMobileMenu={() => setMobileSidebarOpen(true)}
        />

        {/* Content area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Patient list */}
          <PatientListSidebar
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />

          {/* Main panel */}
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 lg:p-6 gap-4 lg:gap-6">
            {/* Patient header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold" style={{ color: 'hsl(210 40% 96%)' }}>
                    {selectedPatient.name}
                  </h1>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: selectedPatient.connected
                        ? 'hsl(142 71% 45% / 0.15)'
                        : 'hsl(215 15% 45% / 0.15)',
                      color: selectedPatient.connected ? 'hsl(142 71% 55%)' : 'hsl(215 15% 55%)',
                    }}
                  >
                    {selectedPatient.connected ? '● LIVE' : '○ OFFLINE'}
                  </span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: 'hsl(215 20% 55%)' }}>
                  {selectedPatient.age}y {selectedPatient.gender} · {selectedPatient.ward} ·{' '}
                  {selectedPatient.condition}
                </p>
              </div>

              {/* Tab selector */}
              <div
                className="flex rounded-lg p-1 gap-1"
                style={{ background: 'hsl(222 47% 9%)' }}
              >
                {(['vitals', 'trends', 'history'] as const).map((tab) => (
                  <button
                    key={`tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 capitalize"
                    style={{
                      background: activeTab === tab ? 'hsl(222 47% 15%)' : 'transparent',
                      color:
                        activeTab === tab ? 'hsl(210 40% 96%)' : 'hsl(215 20% 55%)',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            {activeTab === 'vitals' && (
              <div className="space-y-4 lg:space-y-6 fade-in">
                <VitalsGrid patient={selectedPatient} />
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-4 fade-in">
                <VitalTrendChart patient={selectedPatient} />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4 fade-in">
                <HistoryTable patient={selectedPatient} />
              </div>
            )}
          </main>

          {/* Alert feed */}
          <AlertFeed
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            onAcknowledgeAll={acknowledgeAll}
          />
        </div>
      </div>
    </div>
  );
}

function HistoryTable({ patient }: { patient: Patient }) {
  const rows = [...patient.history].reverse().slice(0, 50);

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
          Reading History
        </h3>
        <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
          Last {rows.length} readings
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid hsl(222 30% 14%)' }}>
              {['Time', 'Heart Rate', 'SpO₂', 'Temperature', 'Blood Pressure', 'Status'].map(
                (h) => (
                  <th
                    key={`th-${h}`}
                    className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const status = getOverallStatus(r);
              const rowBg = i % 2 === 0 ? 'transparent' : 'hsl(222 47% 10%)';
              return (
                <tr
                  key={r.id}
                  className="transition-colors"
                  style={{ background: rowBg, borderBottom: '1px solid hsl(222 30% 12%)' }}
                >
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'hsl(215 20% 55%)' }}>
                    {new Date(r.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs font-medium" style={{ color: 'hsl(210 40% 90%)' }}>
                    {r.heartRate} BPM
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs font-medium" style={{ color: 'hsl(210 40% 90%)' }}>
                    {r.spo2}%
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs font-medium" style={{ color: 'hsl(210 40% 90%)' }}>
                    {r.temperature}°C
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs font-medium" style={{ color: 'hsl(210 40% 90%)' }}>
                    {r.systolic}/{r.diastolic}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase"
                      style={{
                        background:
                          status === 'critical' ?'hsl(0 84% 60% / 0.15)'
                            : status === 'warning' ?'hsl(38 92% 50% / 0.15)' :'hsl(142 71% 45% / 0.1)',
                        color:
                          status === 'critical' ?'hsl(0 84% 65%)'
                            : status === 'warning' ?'hsl(38 92% 60%)' :'hsl(142 71% 55%)',
                      }}
                    >
                      {status}
                    </span>
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