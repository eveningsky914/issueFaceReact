import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import WorldMap from '../components/WorldMap';
import CountrySelector from '../components/CountrySelector';
import useCountries from '../hooks/useCountries';

const TOPICS = [
  '가자 이스라엘-팔레스타인',
  '대만-중국 안보',
  '이민/난민 문제',
  '안락사',
  '아마존 개발',
];

function Home() {
  const navigate = useNavigate();
  const { countries, loading } = useCountries();

  const [country1, setCountry1] = useState('');
  const [country2, setCountry2] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const topic = topicInput || selectedTopic;

  const handleCountryClick = (cca2) => {
    if (cca2 === country1) { setCountry1(''); return; }
    if (cca2 === country2) { setCountry2(''); return; }
    if (!country1) { setCountry1(cca2); return; }
    if (!country2) { setCountry2(cca2); return; }
    // 둘 다 선택됐으면 첫번째 교체
    setCountry1(cca2);
  };

  const handleCountryBackground = (cca2) => {
    if (cca2) navigate(`/country/${cca2}`);
  };

  const handleAnalysis = () => {
    if (!country1 || !country2) { alert('두 국가를 선택해주세요.'); return; }
    if (!topic) { alert('이슈를 선택하거나 입력해주세요.'); return; }
    navigate(`/analysis?country1=${country1}&country2=${country2}&topic=${encodeURIComponent(topic)}`);
  };

  const getCountryName = (cca2) => {
    const c = countries.find((x) => x.cca2 === cca2);
    return c ? (c.translations?.kor?.common || c.name.common) : cca2;
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />

      <main className="flex flex-1 gap-0 overflow-hidden">
        {/* 지도 영역 */}
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
          
          {/* 지도 위 힌트 */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-cream/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border text-xs font-body text-muted pointer-events-none">
            지도를 클릭해 국가를 선택하세요
          </div>
        </div>

        {/* 우측 패널 */}
        <div className="w-80 shrink-0 border-l border-border bg-cream flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* 1. 국가 선택 */}
            <section>
              <p className="section-label mb-3">1. 국가 선택</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-body text-muted mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
                    국가 1
                  </label>
                  <CountrySelector
                    countries={countries}
                    value={country1}
                    onChange={setCountry1}
                    placeholder="국가 1 선택"
                  />
                  {country1 && (
                    <button
                      onClick={() => handleCountryBackground(country1)}
                      className="mt-1 text-xs text-accent font-body hover:underline"
                    >
                      {getCountryName(country1)} 배경 보기 →
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-xs font-body text-muted mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-navy inline-block" />
                    국가 2
                  </label>
                  <CountrySelector
                    countries={countries}
                    value={country2}
                    onChange={setCountry2}
                    placeholder="국가 2 선택"
                  />
                  {country2 && (
                    <button
                      onClick={() => handleCountryBackground(country2)}
                      className="mt-1 text-xs text-accent font-body hover:underline"
                    >
                      {getCountryName(country2)} 배경 보기 →
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* 2. 주제 선택 */}
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

          </div>

          {/* 분석 버튼 */}
          <div className="p-5 border-t border-border">
            {country1 && country2 && (
              <div className="mb-3 text-xs font-mono text-muted bg-parchment px-3 py-2 rounded-sm">
                <span className="text-accent">{getCountryName(country1)}</span>
                {' '}<span className="text-muted">vs</span>{' '}
                <span className="text-navy">{getCountryName(country2)}</span>
              </div>
            )}
            <button
              onClick={handleAnalysis}
              disabled={!country1 || !country2 || !topic}
              className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              뉴스 분석 시작
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
