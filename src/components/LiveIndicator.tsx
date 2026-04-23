'use client';
import React from 'react';

interface LiveIndicatorProps {
  connected: boolean;
  lastUpdated?: number;
}

export default function LiveIndicator({ connected, lastUpdated }: LiveIndicatorProps) {
  const secondsAgo = lastUpdated ? Math.floor((Date.now() - lastUpdated) / 1000) : null;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        {connected && (
          <span
            className="absolute inline-block w-3 h-3 rounded-full opacity-60"
            style={{
              backgroundColor: 'hsl(142 71% 45%)',
              animation: 'pulse-ring 1.5s ease-out infinite',
            }}
          />
        )}
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: connected ? 'hsl(142 71% 45%)' : 'hsl(215 15% 45%)',
            boxShadow: connected ? '0 0 6px hsl(142 71% 45%)' : 'none',
          }}
        />
      </div>
      <span
        className="text-xs font-medium"
        style={{ color: connected ? 'hsl(142 71% 45%)' : 'hsl(215 15% 45%)' }}
      >
        {connected ? 'LIVE' : 'OFFLINE'}
      </span>
      {secondsAgo !== null && connected && (
        <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
          {secondsAgo}s ago
        </span>
      )}
    </div>
  );
}