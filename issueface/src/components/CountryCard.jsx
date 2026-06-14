import React from 'react';
import { useNavigate } from 'react-router-dom';
import ToneGauge from './ToneGauge';

// tone -5~+5, 중립 기준 -1~+1
function getSentiment(tone) {
  if (tone <= -3) return '매우 부정적';
  if (tone <= -1) return '부정적';
  if (tone < 1)  return '중립적';
  if (tone < 3)  return '긍정적';
  return '매우 긍정적';
}

function getEmoji(tone) {
  if (tone <= -3) return '😡';
  if (tone <= -1) return '😟';
  if (tone < 1)  return '😐';
  if (tone < 3)  return '😊';
  return '😄';
}

function CountryCard({ countryCode, countryName, flag, data }) {
  const navigate = useNavigate();

  // 기사 없으면 카드 숨김
  if (!data?.hasData) return null;

  const sentiment = getSentiment(data.tone);
  const emoji = getEmoji(data.tone);
  const keyPhrases = data.keyPhrases || [];
  const fallbackKeywords = data.keywords || [];
  const hasKeyPhrases = keyPhrases.length > 0;

  return (
    <div className="card p-5 flex flex-col gap-4 animate-slide-up">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{flag}</span>
        <div>
          <h3 className="font-display font-bold text-lg text-ink">{countryName}</h3>
          <span className="text-xs font-mono text-muted">{countryCode}</span>
        </div>
        <span className="ml-auto text-3xl" title={sentiment}>{emoji}</span>
      </div>

      {/* Tone 게이지 */}
      <ToneGauge tone={data.tone} label="Tone" />

      {/* 요약 */}
      <div className="bg-parchment border border-border rounded-sm px-3 py-2">
        <p className="text-xs font-body text-muted leading-relaxed">{data.summary}</p>
      </div>

      {/* 핵심 보도 표현 */}
      <div>
        <p className="section-label mb-2">{hasKeyPhrases ? '핵심 보도 표현' : '핵심어'}</p>
        {data.frameSummary && (
          <p className="text-xs font-body text-muted leading-relaxed mb-2">
            {data.frameSummary}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {hasKeyPhrases
            ? keyPhrases.map((phrase) => (
              <span
                key={`${phrase.type}-${phrase.text}`}
                className="text-xs font-body font-medium px-2 py-0.5 rounded-full border border-border bg-cream text-ink"
              >
                <span className="font-mono text-accent">[{phrase.type}]</span>{' '}
                {phrase.text}
              </span>
            ))
            : fallbackKeywords.map((kw) => (
              <span
                key={kw}
                className="text-xs font-body font-medium px-2 py-0.5 rounded-full border border-border bg-cream text-ink"
              >
                <span className="font-mono text-muted">[핵심어]</span>{' '}
                {kw}
              </span>
            ))}
        </div>
      </div>

      {/* 대표 뉴스 TOP 3 — 클릭 시 원문 이동 */}
      <div>
        <p className="section-label mb-2">대표 뉴스 TOP 3</p>
        <ul className="space-y-2">
          {(data.topNews || []).map((news, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-mono text-accent shrink-0 text-xs mt-0.5">{i + 1}.</span>
              {news.url ? (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-body text-muted hover:text-accent hover:underline leading-relaxed transition-colors cursor-pointer"
                >
                  {news.title}
                </a>
              ) : (
                <span className="text-xs font-body text-muted leading-relaxed">
                  {news.title || news}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 국가 배경 링크 */}
      <button
        onClick={() => navigate(`/country/${countryCode}`)}
        className="text-xs text-accent font-body hover:underline self-start mt-auto"
      >
        {countryName} 국가 배경 보기 →
      </button>
    </div>
  );
}

export default CountryCard;
