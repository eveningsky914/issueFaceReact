import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CountryCard from '../components/CountryCard';
import PerspectiveCompareCard from '../components/PerspectiveCompareCard';
import CompareStats from '../components/CompareStats';
import useCountries from '../hooks/useCountries';
import useNewsAnalysis from '../hooks/useNewsAnalysis';

function Analysis() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { analyze, result, loading, error } = useNewsAnalysis();
  const called = useRef(false);

  const country1Code = params.get('country1');
  const country2Code = params.get('country2');
  const topic = params.get('topic') || '';

  const getCountry = (cca2) => countries.find((c) => c.cca2 === cca2);

  useEffect(() => {
    if (called.current || !country1Code || !country2Code || !topic) return;
    if (countries.length === 0) return;
    called.current = true;

    const c1 = getCountry(country1Code);
    const c2 = getCountry(country2Code);

    analyze({
      country1: country1Code,
      country2: country2Code,
      country1Name: c1?.translations?.kor?.common || c1?.name?.common || country1Code,
      country2Name: c2?.translations?.kor?.common || c2?.name?.common || country2Code,
      country1NameEn: c1?.name?.common || country1Code,
      country2NameEn: c2?.name?.common || country2Code,
      topic,
    });
  }, [countries]);

  const c1 = getCountry(country1Code);
  const c2 = getCountry(country2Code);
  const c1Name = c1?.translations?.kor?.common || c1?.name?.common || country1Code;
  const c2Name = c2?.translations?.kor?.common || c2?.name?.common || country2Code;
  const both = result?.country1?.hasData && result?.country2?.hasData;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">

        {/* 상단 */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button onClick={() => navigate('/')} className="text-sm font-body text-muted hover:text-ink mb-3 flex items-center gap-1.5 transition-colors">
              ← 다시 선택하기
            </button>
            <h1 className="font-display text-3xl font-bold text-ink">{topic}</h1>
            <p className="font-body text-muted mt-1 text-sm">
              {c1Name} <span className="font-mono text-border">vs</span> {c2Name} 뉴스 비교
            </p>
          </div>
          <div className="text-right">
            <span className="section-label">분석 기간</span>
            <p className="font-mono text-sm text-ink mt-0.5">최근 1개월</p>
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-muted text-sm">뉴스를 분석하는 중...</p>
            <p className="font-mono text-xs text-border">Google News RSS 수집 중</p>
          </div>
        )}

        {/* 오류 */}
        {error && !loading && (
          <div className="card p-6 text-center animate-fade-in">
            <p className="text-accent font-body font-semibold mb-2">분석 중 오류가 발생했습니다</p>
            <p className="text-sm text-muted font-body mb-4">{error}</p>
            <button onClick={() => navigate('/')} className="btn-secondary mt-4 text-sm">돌아가기</button>
          </div>
        )}

        {/* 결과 */}
        {result && !loading && (
          <div className="animate-fade-in space-y-6">

            {/* 비교 요약 */}
            <div className="card p-5 border-l-4 border-accent">
              <p className="section-label mb-2">분석 요약</p>
              <p className="font-body text-sm text-ink leading-relaxed">{result.comparison}</p>
              {result.comparisonFrameSummary && (
                <p className="font-body text-sm text-muted leading-relaxed mt-2">
                  {result.comparisonFrameSummary}
                </p>
              )}
            </div>

            {/* 뉴스 카드 + Tone 차트 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.country1.hasData
                ? <CountryCard countryCode={country1Code} countryName={c1Name} flag={c1?.flag} data={result.country1} />
                : <NoDataCard flag={c1?.flag} name={c1Name} />
              }

              <div className="md:col-span-1 flex flex-col gap-4">
                {both ? (
                  <>
                    <PerspectiveCompareCard
                      country1Name={c1Name}
                      country2Name={c2Name}
                      country1Data={result.country1}
                      country2Data={result.country2}
                    />
                    <div className="card p-4 flex flex-col flex-1 min-h-[180px]">
                      <p className="section-label">캐릭터 상호작용</p>
                    </div>
                  </>
                ) : (
                  <div className="card p-4 flex items-center justify-center text-xs text-muted font-body text-center min-h-[120px]">
                    두 나라 모두 뉴스가 있어야<br />비교 차트가 표시됩니다.
                  </div>
                )}
              </div>

              {result.country2.hasData
                ? <CountryCard countryCode={country2Code} countryName={c2Name} flag={c2?.flag} data={result.country2} />
                : <NoDataCard flag={c2?.flag} name={c2Name} />
              }
            </div>

            {/* 상세 비교 지표 */}
            <div>
              <h2 className="font-display text-xl font-bold text-ink mb-4">상세 비교 지표</h2>
              <CompareStats
                result={result}
                c1Name={c1Name}
                c2Name={c2Name}
                c1Code={country1Code}
                c2Code={country2Code}
              />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

function NoDataCard({ flag, name }) {
  return (
    <div className="card p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[200px] opacity-60">
      <span className="text-4xl">{flag}</span>
      <p className="font-display font-bold text-ink">{name}</p>
      <p className="text-xs text-muted font-body leading-relaxed">
        관련 뉴스를 찾을 수 없습니다.<br />다른 주제어로 검색해보세요.
      </p>
    </div>
  );
}

export default Analysis;
