import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

function Introduction() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 animate-fade-in">
        <div className="mb-2">
          <span className="section-label">IssueFace — Introduction</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-ink mb-8 leading-tight">
          뉴스로 보는<br />세계의 시각
        </h1>

        <div className="space-y-8 font-body text-ink/80">
          <div className="card p-6">
            <div className="text-4xl mb-4">📰</div>
            <h2 className="font-display text-xl font-semibold text-ink mb-3">
              Q. IssueFace는 무엇인가요?
            </h2>
            <p className="leading-relaxed text-sm">
              뉴스 데이터를 기반으로 특정 이슈의 국가별 감정지수를 비교해주는 서비스입니다.
              연관어, 대표뉴스, tone 점수, 감정 캐릭터 등을 제공하여 더욱 풍부한 분석을 돕습니다.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold text-ink mb-3">어떻게 분석하나요?</h2>
            <ul className="space-y-3 text-sm">
              {[
                ['GDELT 데이터베이스', '전 세계 뉴스 미디어에서 실시간으로 수집되는 오픈소스 이벤트 데이터베이스를 활용합니다.'],
                ['AI 감정 분석', 'Claude AI가 각국 뉴스의 논조와 감정을 -5~+5 범위의 Tone 점수로 변환합니다.'],
                ['비교 시각화', '두 나라의 감정 지수, 연관어, 대표 뉴스를 한눈에 비교할 수 있습니다.'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="text-accent font-bold">—</span>
                  <div>
                    <span className="font-semibold text-ink">{title}:</span>{' '}
                    <span>{desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-parchment border border-border rounded-sm p-4 text-xs text-muted leading-relaxed">
            ⚠️ <strong>주의사항:</strong> 저희의 데이터는 국민 여론조사가 아니라 언론 보도 데이터 기반입니다.
            실제 국민 여론과 일치하지 않을 수도 있습니다.
          </div>
        </div>

        <div className="mt-10">
          <Link to="/" className="btn-primary inline-block">
            ← 홈으로
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Introduction;
