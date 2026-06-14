import React from 'react';
import { useNavigate } from 'react-router-dom';
import ToneGauge from './ToneGauge';
import { getCharacterImage } from '../utils/characterImages';
import { getMoodFromTone } from '../utils/toneMood';

const flagImageMap = {
  KR: 'https://flagcdn.com/w40/kr.png',
  US: 'https://flagcdn.com/w40/us.png',
  JP: 'https://flagcdn.com/w40/jp.png',
  CN: 'https://flagcdn.com/w40/cn.png',
  BR: 'https://flagcdn.com/w40/br.png',
  ID: 'https://flagcdn.com/w40/id.png',
  AU: 'https://flagcdn.com/w40/au.png',
  GB: 'https://flagcdn.com/w40/gb.png',
  EG: 'https://flagcdn.com/w40/eg.png',
};

function getMoodColorClasses(tone) {
  const mood = getMoodFromTone(tone);

  if (mood === 'positive') {
    return {
      badge: 'border-green-700/30 bg-green-700/10 text-green-700',
      number: 'text-green-700',
    };
  }

  if (mood === 'negative') {
    return {
      badge: 'border-accent/30 bg-accent/10 text-accent',
      number: 'text-accent',
    };
  }

  return {
    badge: 'border-muted/30 bg-muted/10 text-muted',
    number: 'text-muted',
  };
}

function CountryCard({ countryCode, countryName, data }) {
  const navigate = useNavigate();

  if (!data?.hasData) return null;

  const characterImage = getCharacterImage(countryCode, data.tone);
  const keyPhrases = data.keyPhrases || [];
  const fallbackKeywords = data.keywords || [];
  const hasKeyPhrases = keyPhrases.length > 0;
  const moodClasses = getMoodColorClasses(data.tone);
  const formattedTone = `${data.tone > 0 ? '+' : ''}${data.tone.toFixed(2)}`;
  const flagImage = flagImageMap[countryCode];

  return (
    <div className="card p-5 flex flex-col gap-4 animate-slide-up overflow-hidden">
      <div className="flex items-start gap-5">
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start gap-3">
            {flagImage && (
              <img
                src={flagImage}
                alt={`${countryName} 국기`}
                className="w-8 h-6 object-cover rounded-sm border border-border mt-0.5 shrink-0"
              />
            )}
            <div className="min-w-0">
              <h3 className="font-display font-bold text-xl text-ink truncate">{countryName}</h3>
              <span className="text-xs font-mono text-muted">{countryCode}</span>
            </div>
          </div>

          <div className="mt-5">
            <span className={`inline-flex border rounded-full px-2.5 py-1 text-xs font-body font-bold ${moodClasses.badge}`}>
              현재 감정
            </span>
          </div>

          <p className={`mt-3 font-mono text-4xl font-bold leading-none ${moodClasses.number}`}>
            {formattedTone}
          </p>

          <div className="mt-5">
            <ToneGauge tone={data.tone} showValue={false} />
          </div>
        </div>

        <div className="w-36 sm:w-44 shrink-0 bg-parchment border border-border rounded-sm overflow-hidden">
          <img
            src={characterImage}
            alt={`${countryName} 캐릭터`}
            className="w-full h-52 object-contain object-top"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
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
