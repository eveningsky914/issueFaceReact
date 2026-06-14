import React from 'react';

function ToneGauge({ tone, label }) {
  // tone: -5 ~ +5
  const pct = ((tone + 5) / 10) * 100;
  const color = tone < -1 ? '#c1440e' : tone > 1 ? '#1a6b3c' : '#8a8070';
  const sentiment =
    tone <= -3 ? '매우 부정적' :
    tone <= -1 ? '부정적' :
    tone < 1  ? '중립적' :
    tone < 3  ? '긍정적' : '매우 긍정적';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-muted">–5</span>
        <span className="font-bold text-ink">{label}</span>
        <span className="text-muted">+5</span>
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
      <div className="flex justify-between items-center">
        <span className="font-mono font-bold text-lg" style={{ color }}>{tone > 0 ? '+' : ''}{tone.toFixed(2)}</span>
        <span className="text-xs font-body text-muted">{sentiment}</span>
      </div>
    </div>
  );
}

export default ToneGauge;
