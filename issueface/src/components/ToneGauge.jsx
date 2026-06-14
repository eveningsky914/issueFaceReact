import React from 'react';

function ToneGauge({ tone, showValue = true }) {
  const pct = ((tone + 5) / 10) * 100;
  const color = tone <= -0.5 ? '#c1440e' : tone >= 0.5 ? '#1a6b3c' : '#8a8070';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-body font-bold">
        <span className="text-accent">부정적</span>
        <span className="text-green-700">긍정적</span>
      </div>
      <div className="relative h-3 bg-parchment border border-border rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-ink border-2 border-cream shadow transition-all duration-700"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      {showValue && (
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-lg" style={{ color }}>
            {tone > 0 ? '+' : ''}{tone.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

export default ToneGauge;
