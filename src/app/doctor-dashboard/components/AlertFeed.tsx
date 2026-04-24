'use client';
import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle } from 'lucide-react';
import type { Alert } from '@/lib/vitals';

interface AlertFeedProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export default function AlertFeed({ alerts, onAcknowledge, onAcknowledgeAll }: AlertFeedProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'critical' | 'warnings'>('active');
  const [expanded, setExpanded] = useState(true);

  const filtered = alerts.filter((a) => {
    const safeSeverity = a.severity.toLowerCase();
    switch (filter) {
      case 'active':
        return !a.acknowledged; 
      
      case 'critical':
        return a.severity === 'critical' && !a.acknowledged; 
      
      case 'warnings':
        return a.severity === 'warning' && !a.acknowledged;
      
      case 'all':
      default:
        return true; 
    }
  }).slice(0, 50);

  const activeCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <aside
      className={`hidden lg:flex flex-col border-l transition-all duration-300 ${expanded ? 'w-72 xl:w-80' : 'w-12'}`}
      style={{
        background: 'hsl(222 47% 8%)',
        borderColor: 'hsl(222 30% 14%)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'hsl(222 30% 14%)' }}
      >
        <button
          onClick={() => setExpanded((e) => !e)}
          className="p-1 rounded transition-colors"
          style={{ color: 'hsl(215 20% 55%)' }}
        >
          <Bell size={16} />
        </button>
        {expanded && (
          <>
            <span className="text-xs font-semibold uppercase tracking-wider flex-1" style={{ color: 'hsl(215 15% 55%)' }}>
              Alerts
            </span>
            {activeCount > 0 && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'hsl(0 84% 60% / 0.2)', color: 'hsl(0 84% 65%)' }}
              >
                {activeCount}
              </span>
            )}
            {activeCount > 0 && (
              <button
                onClick={onAcknowledgeAll}
                className="p-1 rounded transition-colors"
                title="Acknowledge all alerts"
                style={{ color: 'hsl(215 20% 55%)' }}
              >
                <CheckCheck size={14} />
              </button>
            )}
          </>
        )}
      </div>

      {expanded && (
        <>
          {/* Filter tabs */}
          <div
            className="flex gap-1 px-2 py-2 border-b"
            style={{ borderColor: 'hsl(222 30% 14%)' }}
          >
            {(['active', 'critical', 'warnings', 'all'] as const).map((f) => (
              <button
                key={`filter-${f}`}
                onClick={() => setFilter(f)}
                className="flex-1 py-1 rounded text-xs font-medium transition-all duration-150 capitalize"
                style={{
                  background: filter === f ? 'hsl(222 47% 16%)' : 'transparent',
                  color: filter === f ? 'hsl(210 40% 90%)' : 'hsl(215 15% 45%)',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Alert list */}
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1.5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'hsl(142 71% 45% / 0.1)' }}
                >
                  <CheckCheck size={18} style={{ color: 'hsl(142 71% 55%)' }} />
                </div>
                <p className="text-xs text-center" style={{ color: 'hsl(215 15% 45%)' }}>
                  {filter === 'active' ? 'No active alerts' : 'No alerts match this filter'}
                </p>
              </div>
            ) : (
              filtered.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={onAcknowledge}
                />
              ))
            )}
          </div>
        </>
      )}
    </aside>
  );
}

function AlertItem({ alert, onAcknowledge }: { alert: Alert; onAcknowledge: (id: string) => void }) {
  const isCritical = alert.severity === 'critical';
  const timeStr = new Date(alert.timestamp).toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className="rounded-lg p-2.5 border transition-all duration-150 slide-up"
      style={{
        background: alert.acknowledged
          ? 'hsl(222 47% 10%)'
          : isCritical
          ? 'hsl(0 84% 60% / 0.07)'
          : 'hsl(38 92% 50% / 0.06)',
        borderColor: alert.acknowledged
          ? 'hsl(222 30% 16%)'
          : isCritical
          ? 'hsl(0 84% 60% / 0.35)'
          : 'hsl(38 92% 50% / 0.3)',
        opacity: alert.acknowledged ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          size={13}
          className="flex-shrink-0 mt-0.5"
          style={{
            color: alert.acknowledged
              ? 'hsl(215 15% 45%)'
              : isCritical
              ? 'hsl(0 84% 65%)'
              : 'hsl(38 92% 60%)',
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: 'hsl(210 40% 90%)' }}>
              {alert.patientName.split(' ')[0]}
            </span>
            <span
              className="text-xs px-1.5 py-0 rounded-full font-semibold uppercase"
              style={{
                background: isCritical ? 'hsl(0 84% 60% / 0.2)' : 'hsl(38 92% 50% / 0.15)',
                color: isCritical ? 'hsl(0 84% 65%)' : 'hsl(38 92% 60%)',
              }}
            >
              {alert.severity}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'hsl(215 20% 60%)' }}>
            {alert.message}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="font-mono text-xs" style={{ color: 'hsl(215 15% 40%)' }}>
              {timeStr}
            </span>
            {!alert.acknowledged && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="text-xs px-2 py-0.5 rounded transition-all duration-150 font-medium"
                style={{
                  background: 'hsl(222 47% 18%)',
                  color: 'hsl(199 89% 65%)',
                }}
              >
                Ack
              </button>
            )}
            {alert.acknowledged && (
              <span className="text-xs" style={{ color: 'hsl(142 71% 45%)' }}>
                ✓ Ack'd
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}