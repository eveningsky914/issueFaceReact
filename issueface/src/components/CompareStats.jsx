import React from 'react';
import { getPressData } from '../utils/pressFreedom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

// ── 국가별 분석 신뢰도 ───────────────────────────────────────────
function AnalysisReliability({ c1Name, c2Name, c1Code, c2Code, count1, count2 }) {
  const targetCount = 10;

  function buildMetric(name, code, count, accent) {
    const press = getPressData(code);
    const articleScore = Math.min(count / targetCount, 1);
    const pressScore = press ? press.score / 100 : 0.5;
    const reliability = Math.round(100 * Math.pow(articleScore, 0.7) * Math.pow(pressScore, 0.3));

    return {
      name,
      code,
      count,
      accent,
      press,
      articleScore,
      reliability,
      level: reliability >= 85 ? '높음' : reliability >= 65 ? '보통' : '낮음',
    };
  }

  const metrics = [
    buildMetric(c1Name, c1Code, count1, '#c1440e'),
    buildMetric(c2Name, c2Code, count2, '#1a2744'),
  ];

  function ReliabilityCard({ metric }) {
    const ringStyle = {
      background: `conic-gradient(${metric.accent} ${metric.reliability * 3.6}deg, #ede8dc 0deg)`,
    };
    const pressText = metric.press
      ? `${metric.press.score.toFixed(1)}점`
      : '자료 없음';
    const rankText = metric.press
      ? `세계 ${metric.press.rank}위 / 180`
      : '기본값 50점 적용';
    const note = metric.count >= targetCount && metric.press?.score >= 75
      ? '기사 수가 충분하고 언론자유지수도 높아 신뢰도가 높습니다.'
      : metric.count >= targetCount
      ? '기사 수는 충분하지만 언론자유지수에 따라 신뢰도가 보정되었습니다.'
      : '수집 기사 수가 적어 신뢰도가 낮게 보정되었습니다.';

    return (
      <div className="card p-5">
        <div className="flex items-start gap-5">
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-bold mb-4 truncate" style={{ color: metric.accent }}>
              {metric.name} 분석 신뢰도
            </p>

            <div className="flex items-end gap-2 mb-4">
              <span className="font-display text-5xl font-bold leading-none" style={{ color: metric.accent }}>
                {metric.reliability}
              </span>
              <span className="font-body text-xl font-bold text-muted mb-1">/ 100</span>
              <span
                className="text-xs font-body font-bold px-2.5 py-1 rounded-full border mb-1"
                style={{ color: metric.accent, borderColor: `${metric.accent}33`, backgroundColor: `${metric.accent}12` }}
              >
                {metric.level}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-parchment border border-border rounded-sm p-3">
                <p className="section-label mb-1">언론자유지수</p>
                <p className="font-mono text-xl font-bold text-ink">{pressText}</p>
                <p className="font-body text-xs text-muted mt-1">{rankText}</p>
              </div>
              <div className="bg-parchment border border-border rounded-sm p-3">
                <p className="section-label mb-1">수집 기사 수</p>
                <p className="font-mono text-xl font-bold text-ink">{metric.count}건</p>
                <p className="font-body text-xs text-muted mt-1">목표 {targetCount}건</p>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="w-28 h-28 rounded-full p-2" style={ringStyle}>
              <div className="w-full h-full rounded-full bg-cream border border-border flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-bold leading-none" style={{ color: metric.accent }}>
                  {metric.reliability}
                </span>
                <span className="font-mono text-xs text-muted mt-1">/100</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs font-body text-ink leading-relaxed mt-4">{note}</p>
        <div className="border-t border-border border-dashed mt-4 pt-3">
          <p className="text-xs font-body text-muted">
            산정 기준: 100 x 기사수점수<sup>0.7</sup> x 언론자유점수<sup>0.3</sup>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-2xl font-bold text-ink mb-1">국가별 분석 신뢰도</h3>
      <p className="font-body text-sm text-muted mb-5">
        기사 수와 언론자유지수를 바탕으로 국가별 결과 해석 신뢰도를 산정했습니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <ReliabilityCard key={metric.code} metric={metric} />
        ))}
      </div>
    </div>
  );
}

// ── Tone 분포 차트 ───────────────────────────────────────────────
function ToneDistribution({ c1Name, c2Name, articles1, articles2 }) {
  function classify(articles) {
    const pos = articles.filter((a) => a.toneScore > 0.5).length;
    const neg = articles.filter((a) => a.toneScore < -0.5).length;
    const neu = articles.length - pos - neg;
    const total = articles.length;

    return {
      pos,
      neu,
      neg,
      total,
      posPct: total ? (pos / total) * 100 : 0,
      neuPct: total ? (neu / total) * 100 : 0,
      negPct: total ? (neg / total) * 100 : 0,
    };
  }

  const d1 = classify(articles1 || []);
  const d2 = classify(articles2 || []);

  const formatPct = (value) => `${value.toFixed(1)}%`;
  const rows = [
    { name: c1Name, data: d1, accent: '#c1440e' },
    { name: c2Name, data: d2, accent: '#1a2744' },
  ];

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
            title={`중립/혼합 ${formatPct(data.neuPct)}`}
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
            중립/혼합 {formatPct(data.neuPct)}
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
    <div>
      <p className="text-xs text-muted font-body leading-relaxed mb-5">
        부정, 중립/혼합, 긍정 비율을 100% 누적 막대로 비교합니다.
      </p>
      <div className="space-y-6">
        {rows.map((row) => (
          <DistributionRow key={row.name} name={row.name} data={row.data} accent={row.accent} />
        ))}
      </div>
    </div>
  );
}

// ── 종합 지표 레이더 ─────────────────────────────────────────────
function OverviewRadar({ c1Name, c2Name, c1Code, c2Code, tone1, tone2, count1, count2 }) {
  const pf1 = getPressData(c1Code);
  const pf2 = getPressData(c2Code);

  const normalize = (v, min, max) => Math.round(((v - min) / (max - min)) * 100);

  const data = [
    {
      subject: 'Tone',
      [c1Name]: normalize(tone1, -5, 5),
      [c2Name]: normalize(tone2, -5, 5),
    },
    {
      subject: '언론자유',
      [c1Name]: pf1 ? Math.round(pf1.score) : 50,
      [c2Name]: pf2 ? Math.round(pf2.score) : 50,
    },
    {
      subject: '기사 수',
      [c1Name]: normalize(count1, 0, Math.max(count1, count2, 1)),
      [c2Name]: normalize(count2, 0, Math.max(count1, count2, 1)),
    },
    {
      subject: '긍정 비율',
      [c1Name]: 50, // placeholder
      [c2Name]: 50,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#d4cfc5" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#8a8070' }} />
        <Radar name={c1Name} dataKey={c1Name} stroke="#c1440e" fill="#c1440e" fillOpacity={0.25} />
        <Radar name={c2Name} dataKey={c2Name} stroke="#1a2744" fill="#1a2744" fillOpacity={0.25} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans' }} />
        <Tooltip contentStyle={{ background: '#f5f0e8', border: '1px solid #d4cfc5', fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────
function CompareStats({ result, c1Name, c2Name, c1Code, c2Code }) {
  const count1 = result.country1.hasData ? (result.country1.articleCount || 0) : 0;
  const count2 = result.country2.hasData ? (result.country2.articleCount || 0) : 0;
  const tone1  = result.country1.hasData ? result.country1.tone : 0;
  const tone2  = result.country2.hasData ? result.country2.tone : 0;

  return (
    <div className="space-y-4">
      {/* Tone 분포 */}
      {(result.country1.hasData || result.country2.hasData) && (
        <div className="card p-5">
          <p className="section-label mb-4">Tone 분포 비교 <span className="normal-case font-body text-muted">(긍정/중립/부정 비율)</span></p>
          <ToneDistribution
            c1Name={c1Name}
            c2Name={c2Name}
            articles1={result.country1.allArticles || []}
            articles2={result.country2.allArticles || []}
          />
        </div>
      )}

      {/* 분석 신뢰도 */}
      <AnalysisReliability
        c1Name={c1Name}
        c2Name={c2Name}
        c1Code={c1Code}
        c2Code={c2Code}
        count1={count1}
        count2={count2}
      />

      {/* 종합 레이더 */}
      {result.country1.hasData && result.country2.hasData && (
        <div className="card p-5">
          <p className="section-label mb-2">종합 지표 비교</p>
          <OverviewRadar
            c1Name={c1Name} c2Name={c2Name}
            c1Code={c1Code} c2Code={c2Code}
            tone1={tone1} tone2={tone2}
            count1={count1} count2={count2}
          />
        </div>
      )}

    </div>
  );
}

export default CompareStats;
