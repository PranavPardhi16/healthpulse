'use client';
import React, { useState, useEffect } from 'react';
import { Menu, Bell, Wifi, RefreshCw } from 'lucide-react';

interface DoctorHeaderProps {
  connectedCount: number;
  totalPatients: number;
  activeAlerts: number;
  criticalCount: number;
  lastUpdateTime: number;
  onMobileMenu: () => void;
}

export default function DoctorHeader({
  connectedCount,
  totalPatients,
  activeAlerts,
  criticalCount,
  lastUpdateTime,
  onMobileMenu,
}: DoctorHeaderProps) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const secondsAgo = Math.floor((Date.now() - lastUpdateTime) / 1000);

  return (
    <header
      className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b flex-shrink-0"
      style={{
        background: 'hsl(222 47% 8%)',
        borderColor: 'hsl(222 30% 14%)',
      }}
    >
      <button
        onClick={onMobileMenu}
        className="lg:hidden p-1.5 rounded-lg"
        style={{ color: 'hsl(215 20% 55%)' }}
      >
        <Menu size={20} />
      </button>

      {/* Stats row */}
      <div className="flex items-center gap-2 lg:gap-4 flex-1 overflow-x-auto">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: 'hsl(222 47% 12%)' }}
        >
          <Wifi size={14} style={{ color: 'hsl(142 71% 45%)' }} />
          <span className="text-xs font-medium" style={{ color: 'hsl(210 40% 85%)' }}>
            {connectedCount}/{totalPatients} Connected
          </span>
        </div>

        {activeAlerts > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0"
            style={{
              background: criticalCount > 0 ? 'hsl(0 84% 60% / 0.15)' : 'hsl(38 92% 50% / 0.12)',
            }}
          >
            <Bell
              size={14}
              style={{ color: criticalCount > 0 ? 'hsl(0 84% 65%)' : 'hsl(38 92% 60%)' }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: criticalCount > 0 ? 'hsl(0 84% 70%)' : 'hsl(38 92% 65%)' }}
            >
              {activeAlerts} Active Alert{activeAlerts !== 1 ? 's' : ''}
            </span>
            {criticalCount > 0 && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'hsl(0 84% 60%)', color: 'white' }}
              >
                {criticalCount} Critical
              </span>
            )}
          </div>
        )}

        {activeAlerts === 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0"
            style={{ background: 'hsl(142 71% 45% / 0.1)' }}
          >
            <span className="text-xs font-medium" style={{ color: 'hsl(142 71% 55%)' }}>
              ✓ All Clear
            </span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
          <RefreshCw size={11} />
          <span>{secondsAgo}s ago</span>
        </div>
        <span className="font-mono text-sm font-medium" style={{ color: 'hsl(199 89% 65%)' }}>
          {timeStr}
        </span>
      </div>
    </header>
  );
}