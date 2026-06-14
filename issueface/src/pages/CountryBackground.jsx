import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useCountries from '../hooks/useCountries';

const TABS = ['개요', '역사', '정치', '문화'];

async function fetchWikipediaExtract(countryName) {
  const langs = ['ko', 'en'];
  for (const lang of langs) {
    try {
      const searchRes = await fetch(
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(countryName)}&format=json&origin=*&srlimit=1`
      );
      const searchData = await searchRes.json();
      const title = searchData?.query?.search?.[0]?.title;
      if (!title) continue;

      const pageRes = await fetch(
        `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=false&explaintext&titles=${encodeURIComponent(title)}&format=json&origin=*`
      );
      const pageData = await pageRes.json();
      const page = Object.values(pageData?.query?.pages || {})[0];
      if (page?.extract && page.extract.length > 100) return page.extract;
    } catch {
      continue;
    }
  }
  return '';
}

function parseByTab(extract, tab) {
  const paragraphs = extract.split('\n').filter((p) => p.trim().length > 40);
  const patterns = {
    '역사': /역사|건국|왕조|독립|식민|전쟁|history|founded|dynasty|independence/i,
    '정치': /정치|정부|의회|대통령|민주|공화|politics|government|parliament|president/i,
    '문화': /문화|예술|음악|영화|스포츠|문학|culture|art|music|sport|film|literature/i,
  };
  if (tab === '개요') return paragraphs.slice(0, 4).join('\n\n') || extract.slice(0, 800);
  const pattern = patterns[tab];
  const idx = paragraphs.findIndex((p) => pattern.test(p));
  const slice = idx >= 0 ? paragraphs.slice(idx, idx + 5) : paragraphs.slice(4, 8);
  return slice.join('\n\n') || paragraphs.slice(0, 3).join('\n\n');
}

async function fetchCountryInfo(countryName, tab, country) {
  const extract = await fetchWikipediaExtract(countryName);
  if (tab === '개요') {
    return {
      capital: country?.capital?.[0] || '—',
      population: country?.population ? Number(country.population).toLocaleString('ko-KR') + '명' : '—',
      currency: country?.currencies ? Object.values(country.currencies).map((c) => c.name).join(', ') : '—',
      overview: extract ? parseByTab(extract, '개요') : `${countryName}에 대한 정보를 불러올 수 없습니다.`,
    };
  }
  const keyMap = { '역사': 'history', '정치': 'politics', '문화': 'culture' };
  return {
    [keyMap[tab]]: extract ? parseByTab(extract, tab) : `${countryName}의 ${tab} 정보를 불러올 수 없습니다.`,
  };
}

function CountryBackground() {
  const { cca2 } = useParams();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const [activeTab, setActiveTab] = useState('개요');
  const [tabData, setTabData] = useState({});
  const [loading, setLoading] = useState(false);
  // 이미 fetch 시작한 탭 추적 (중복 호출 방지)
  const fetchedTabs = useRef(new Set());

  const country = countries.find((c) => c.cca2 === cca2);
  const countryName = country?.translations?.kor?.common || country?.name?.common || cca2;

  useEffect(() => {
    // countries 아직 로드 안됐으면 대기
    if (countries.length === 0) return;
    // 이미 fetch했거나 fetch 중이면 스킵
    if (fetchedTabs.current.has(activeTab)) return;

    fetchedTabs.current.add(activeTab);
    setLoading(true);

    fetchCountryInfo(countryName, activeTab, country)
      .then((data) => setTabData((prev) => ({ ...prev, [activeTab]: data })))
      .catch(() => setTabData((prev) => ({ ...prev, [activeTab]: { error: true } })))
      .finally(() => setLoading(false));
  }, [activeTab, countries.length]);

  const data = tabData[activeTab] || {};

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center gap-2 py-8">
        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-body text-muted">Wikipedia에서 불러오는 중...</span>
      </div>
    );
    if (data.error) return <p className="text-sm text-muted font-body py-4">정보를 불러올 수 없습니다.</p>;
    if (!Object.keys(data).length) return null;

    if (activeTab === '개요') return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[['수도', data.capital], ['인구', data.population], ['통화', data.currency]].map(([label, val]) => (
            <div key={label} className="bg-parchment border border-border rounded-sm p-3">
              <p className="section-label mb-1">{label}</p>
              <p className="font-body text-sm font-semibold text-ink">{val || '—'}</p>
            </div>
          ))}
        </div>
        <p className="font-body text-sm text-ink leading-relaxed whitespace-pre-line">{data.overview}</p>
      </div>
    );

    const keyMap = { '역사': 'history', '정치': 'politics', '문화': 'culture' };
    return <p className="font-body text-sm text-ink leading-relaxed whitespace-pre-line">{data[keyMap[activeTab]]}</p>;
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 animate-fade-in">
        <button onClick={() => navigate(-1)} className="text-sm font-body text-muted hover:text-ink mb-6 flex items-center gap-1.5 transition-colors">
          ← 분석화면으로
        </button>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{country?.flag}</span>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">{countryName}</h1>
            <p className="font-mono text-sm text-muted">{country?.name?.common} · {cca2}</p>
          </div>
          <span className="ml-auto font-mono text-xs text-muted border border-border px-2 py-1 rounded-sm">Wikipedia</span>
        </div>
        <div className="flex border-b border-border mb-6">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-body font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
              }`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="animate-fade-in">{renderContent()}</div>
      </main>
    </div>
  );
}

export default CountryBackground;
