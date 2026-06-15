import React from 'react';
import { getPressData } from '../utils/pressFreedom';

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
    const pressText = metric.press ? `${metric.press.score.toFixed(1)}점` : '자료 없음';
    const rankText = metric.press ? `세계 ${metric.press.rank}위 / 180` : '기본값 50점 적용';
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

export default AnalysisReliability;
