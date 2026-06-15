import React from 'react';
import { getToneDistribution } from '../utils/toneDistribution';

function ToneDistributionCompare({ c1Name, c2Name, articles1, articles2 }) {
  const rows = [
    { name: c1Name, data: getToneDistribution(articles1), accent: '#c1440e' },
    { name: c2Name, data: getToneDistribution(articles2), accent: '#1a2744' },
  ];
  const formatPct = (value) => `${value.toFixed(1)}%`;

  function DistributionRow({ name, data, accent }) {
    return (
      <div>
        <div className="flex items-end justify-between gap-3 mb-2">
          <p className="font-body text-sm font-bold truncate" style={{ color: accent }}>
            {name}
          </p>
          <p className="font-mono text-xs text-muted shrink-0">
            총 <span className="font-bold text-ink">{data.total}</span>개 문장
          </p>
        </div>

        <div className="flex h-7 overflow-hidden rounded-full border border-border bg-parchment">
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${data.negPct}%`, backgroundColor: '#d95a3a' }}
            title={`부정 ${formatPct(data.negPct)}`}
          />
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${data.neuPct}%`, backgroundColor: '#9aa4b4' }}
            title={`중립 ${formatPct(data.neuPct)}`}
          />
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${data.posPct}%`, backgroundColor: '#1a8f5a' }}
            title={`긍정 ${formatPct(data.posPct)}`}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs font-mono">
          <span className="font-bold" style={{ color: '#d95a3a' }}>
            부정 {formatPct(data.negPct)}
          </span>
          <span className="text-muted">·</span>
          <span className="font-bold" style={{ color: '#667085' }}>
            중립 {formatPct(data.neuPct)}
          </span>
          <span className="text-muted">·</span>
          <span className="font-bold" style={{ color: '#1a8f5a' }}>
            긍정 {formatPct(data.posPct)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="section-label mb-4">
        감정 분포 비교 <span className="normal-case font-body text-muted">(긍정/중립/부정 비율)</span>
      </p>
      <p className="text-xs text-muted font-body leading-relaxed mb-5">
        부정, 중립, 긍정 비율을 100% 누적 막대로 비교합니다.
      </p>
      <div className="space-y-6">
        {rows.map((row) => (
          <DistributionRow key={row.name} name={row.name} data={row.data} accent={row.accent} />
        ))}
      </div>
    </div>
  );
}

export default ToneDistributionCompare;
