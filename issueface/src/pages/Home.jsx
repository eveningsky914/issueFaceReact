import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import WorldMap from '../components/WorldMap';
import useCountries from '../hooks/useCountries';

const TOPICS = [
  '가자 이스라엘-팔레스타인',
  '대만-중국 안보',
  '이민/난민 문제',
  '안락사',
  '아마존 개발',
];

const COUNTRY_GRID = [
  ['KR', 'US', 'JP'],
  ['CN', 'BR', 'ID'],
  ['AU', 'GB', 'EG'],
];

const COUNTRY_LABELS = {
  KR: '한국',
  US: '미국',
  JP: '일본',
  CN: '중국',
  BR: '브라질',
  ID: '인도네시아',
  AU: '호주',
  GB: '영국',
  EG: '이집트',
};

function Home() {
  const navigate = useNavigate();
  const { countries, loading } = useCountries();

  const [country1, setCountry1] = useState('');
  const [country2, setCountry2] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const topic = topicInput || selectedTopic;

  const handleCountryClick = (cca2) => {
    if (cca2 === country1) {
      setCountry1(country2);
      setCountry2('');
      return;
    }
    if (cca2 === country2) {
      setCountry2('');
      return;
    }
    if (!country1) {
      setCountry1(cca2);
      return;
    }
    if (!country2) {
      setCountry2(cca2);
      return;
    }

    setCountry1(country2);
    setCountry2(cca2);
  };

  const handleAnalysis = () => {
    if (!country1 || !country2) {
      alert('두 국가를 선택해주세요.');
      return;
    }
    if (!topic) {
      alert('이슈를 선택하거나 입력해주세요.');
      return;
    }
    navigate(`/analysis?country1=${country1}&country2=${country2}&topic=${encodeURIComponent(topic)}`);
  };

  const getCountry = (cca2) => countries.find((x) => x.cca2 === cca2);

  const getCountryName = (cca2) => {
    const c = getCountry(cca2);
    return c ? (c.translations?.kor?.common || c.name.common) : (COUNTRY_LABELS[cca2] || cca2);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />

      <main className="flex flex-1 gap-0 overflow-hidden">
        <div className="relative flex-1 min-h-[500px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-sm text-muted animate-pulse-soft">지도 로딩 중...</span>
            </div>
          ) : (
            <WorldMap
              country1={country1}
              country2={country2}
              onCountryClick={handleCountryClick}
            />
          )}

          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-cream/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border text-xs font-body text-muted pointer-events-none">
            지도를 클릭해 국가를 선택하세요
          </div>
        </div>

        <div className="w-80 shrink-0 border-l border-border bg-cream flex flex-col overflow-hidden">
          <div className="flex-1 p-5 space-y-5 overflow-hidden">
            <section>
              <p className="section-label mb-3">1. 국가 선택</p>
              <div className="flex items-center gap-2 mb-3 text-sm font-body text-muted">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
                  국가 1
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-navy inline-block" />
                  국가 2
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {COUNTRY_GRID.flat().map((cca2) => {
                  const order = country1 === cca2 ? 1 : country2 === cca2 ? 2 : null;
                  const selectedClass = order === 1
                    ? 'border-accent bg-accent/5 text-accent scale-[1.06] shadow-sm z-10'
                    : order === 2
                    ? 'border-navy bg-navy/5 text-navy scale-[1.06] shadow-sm z-10'
                    : 'border-border bg-cream text-muted hover:border-muted hover:text-ink';

                  return (
                    <button
                      key={cca2}
                      type="button"
                      onClick={() => handleCountryClick(cca2)}
                      className={`relative h-[82px] border rounded-sm px-2 py-2 text-center transition-all duration-150 ${selectedClass}`}
                    >
                      <p className="font-mono text-base font-bold tracking-wide">{cca2}</p>
                      <p className="font-body text-xs mt-1.5">{COUNTRY_LABELS[cca2]}</p>
                      {order && (
                        <p className="font-body text-[10px] font-bold mt-1.5">
                          {order === 1 ? '① 선택됨' : '② 선택됨'}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

            </section>

            <section>
              <p className="section-label mb-3">2. 주제 선택</p>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => { setTopicInput(e.target.value); setSelectedTopic(''); }}
                placeholder="직접 입력..."
                className="w-full border border-border bg-parchment text-sm font-body px-3 py-2 rounded-sm focus:outline-none focus:border-accent mb-3"
              />
              <p className="text-xs text-muted font-body mb-2">또는 프리셋 선택</p>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setSelectedTopic(t); setTopicInput(''); }}
                    className={`text-xs font-body px-2.5 py-1 rounded-full border transition-colors ${
                      selectedTopic === t
                        ? 'bg-accent text-cream border-accent'
                        : 'bg-cream border-border text-muted hover:border-accent hover:text-accent'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <div className="border-t border-border pt-4">
              <button
                onClick={handleAnalysis}
                disabled={!country1 || !country2 || !topic}
                className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {"\uB274\uC2A4 \uBD84\uC11D \uC2DC\uC791"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
