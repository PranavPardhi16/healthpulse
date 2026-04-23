import React from 'react';
import type { AlertSeverity } from '@/lib/vitals';

interface StatusBadgeProps {
  severity: AlertSeverity;
  label?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ severity, label, size = 'md' }: StatusBadgeProps) {
  const classes = {
    critical: 'alert-badge-critical',
    warning: 'alert-badge-warning',
    normal: 'alert-badge-safe',
  }[severity];

  const defaultLabels = {
    critical: 'CRITICAL',
    warning: 'WARNING',
    normal: 'NORMAL',
  };

  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : '';

  return (
    <span className={`${classes} ${sizeClass} uppercase tracking-wide`}>
      {label ?? defaultLabels[severity]}
    </span>
  );
}