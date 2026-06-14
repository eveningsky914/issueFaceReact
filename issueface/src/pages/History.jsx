import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { clearHistory, getHistory, removeHistory } from '../utils/historyStorage';

function formatTone(tone) {
  if (tone === null || tone === undefined) return '-';
  const value = Number(tone);
  if (Number.isNaN(value)) return '-';
  return value > 0 ? `+${value}` : `${value}`;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function HistoryCard({ item, onDelete, onReplay }) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-xl font-bold text-ink">"{item.topic}"</h2>
            <span className="font-mono text-xs text-muted">{formatDate(item.savedAt)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="text-muted hover:text-accent text-xl leading-none"
          aria-label="히스토리 삭제"
        >
          ×
        </button>
      </div>

      <div className="flex items-end gap-5 mb-4">
        <div>
          <p className="text-xs text-muted font-body mb-1">{item.country1Name || item.country1}</p>
          <p className="font-mono text-lg font-bold text-ink">
            {item.country1}
            <span className="ml-3 text-accent">{formatTone(item.tone1)}</span>
          </p>
        </div>
        <span className="font-mono text-sm text-muted mb-1">vs</span>
        <div>
          <p className="text-xs text-muted font-body mb-1">{item.country2Name || item.country2}</p>
          <p className="font-mono text-lg font-bold text-ink">
            {item.country2}
            <span className="ml-3 text-navy">{formatTone(item.tone2)}</span>
          </p>
        </div>
      </div>

      <p className="text-sm font-body text-muted leading-relaxed mb-4">{item.summary}</p>

      <div className="border-t border-border pt-4">
        <button
          type="button"
          onClick={() => onReplay(item)}
          className="w-full btn-primary"
        >
          다시 분석하기
        </button>
      </div>
    </article>
  );
}

function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const handleDelete = (id) => {
    setItems(removeHistory(id));
  };

  const handleClear = () => {
    setItems(clearHistory());
  };

  const handleReplay = (item) => {
    navigate(`/analysis?country1=${item.country1}&country2=${item.country2}&topic=${encodeURIComponent(item.topic)}`);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-body text-muted hover:text-ink mb-5 transition-colors"
            >
              ← 홈으로
            </button>
            <h1 className="font-display text-4xl font-bold text-ink">분석 히스토리</h1>
            <p className="font-body text-sm text-muted mt-2">최근 분석한 결과 {items.length}건</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={items.length === 0}
            className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            전체 삭제
          </button>
        </div>

        {items.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-body text-muted">아직 분석 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onReplay={handleReplay}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default History;
