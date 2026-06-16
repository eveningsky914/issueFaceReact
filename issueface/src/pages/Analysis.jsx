import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CountryCard from '../components/CountryCard';
import CompareStats from '../components/CompareStats';
import ResultHero from '../components/result/ResultHero';
import useAnalysisHistorySaver from '../hooks/useAnalysisHistorySaver';
import useCountries from '../hooks/useCountries';
import useNewsAnalysis from '../hooks/useNewsAnalysis';
import { buildAnalysisHeroData } from '../utils/analysisHero';

function Analysis() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { analyze, result, loading, error } = useNewsAnalysis();
  const called = useRef(false);

  const country1Code = params.get('country1');
  const country2Code = params.get('country2');
  const keyword = params.get('keyword') || params.get('topic') || '';
  const topicId = params.get('topicId') || '';
  const topic = keyword;

  const getCountry = (cca2) => countries.find((country) => country.cca2 === cca2);

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
      topicId,
    });
  }, [countries]);

  const c1 = getCountry(country1Code);
  const c2 = getCountry(country2Code);
  const c1Name = c1?.translations?.kor?.common || c1?.name?.common || country1Code;
  const c2Name = c2?.translations?.kor?.common || c2?.name?.common || country2Code;
  const heroData = result ? buildAnalysisHeroData(result) : null;

  useAnalysisHistorySaver(result, loading);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="text-sm font-body text-muted hover:text-ink mb-5 flex items-center gap-1.5 transition-colors"
        >
          ← 다시 선택하기
        </button>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-muted text-sm">뉴스를 분석하는 중...</p>
            <p className="font-mono text-xs text-border">Currents News / Google Natural Language 분석 중</p>
          </div>
        )}

        {error && !loading && (
          <div className="card p-6 text-center animate-fade-in">
            <p className="text-accent font-body font-semibold mb-2">분석 중 오류가 발생했습니다</p>
            <p className="text-sm text-muted font-body mb-4">{error}</p>
            <button onClick={() => navigate('/')} className="btn-secondary mt-4 text-sm">돌아가기</button>
          </div>
        )}

        {result && !loading && (
          <div className="animate-fade-in space-y-6">
            <ResultHero heroData={heroData} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.country1.hasData
                ? <CountryCard countryCode={country1Code} countryName={c1Name} flag={c1?.flag} data={result.country1} />
                : <NoDataCard flag={c1?.flag} name={c1Name} />
              }

              {result.country2.hasData
                ? <CountryCard countryCode={country2Code} countryName={c2Name} flag={c2?.flag} data={result.country2} />
                : <NoDataCard flag={c2?.flag} name={c2Name} />
              }
            </div>

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
        관련 뉴스를 찾을 수 없습니다.<br />다른 주제로 검색해보세요.
      </p>
    </div>
  );
}

export default Analysis;
