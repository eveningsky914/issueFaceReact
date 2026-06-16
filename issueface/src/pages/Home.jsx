import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import WorldMap from '../components/WorldMap';
import AnalyzeButton from '../components/home/AnalyzeButton';
import CountrySelectionPanel from '../components/home/CountrySelectionPanel';
import TopicSelector from '../components/home/TopicSelector';
import useCountries from '../hooks/useCountries';

function Home() {
  const navigate = useNavigate();
  const { loading } = useCountries();

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

  const handleTopicInputChange = (value) => {
    setTopicInput(value);
    setSelectedTopic('');
  };

  const handleTopicSelect = (value) => {
    setSelectedTopic(value);
    setTopicInput('');
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
            <CountrySelectionPanel
              country1={country1}
              country2={country2}
              onCountryClick={handleCountryClick}
            />
            <TopicSelector
              topicInput={topicInput}
              selectedTopic={selectedTopic}
              onTopicInputChange={handleTopicInputChange}
              onTopicSelect={handleTopicSelect}
            />
            <AnalyzeButton
              onClick={handleAnalysis}
              disabled={!country1 || !country2 || !topic}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
