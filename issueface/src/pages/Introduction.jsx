import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

function Introduction() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 animate-fade-in">
        <div className="mb-2">
          <span className="section-label">IssueFace · Introduction</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-ink mb-8 leading-tight">
          뉴스로 보는<br />국가별 시각 차이
        </h1>

        <div className="space-y-8 font-body text-ink/80">
          <div className="card p-6">
            <div className="text-4xl mb-4">IF</div>
            <h2 className="font-display text-xl font-semibold text-ink mb-3">
              Q. IssueFace는 무엇인가요?
            </h2>
            <p className="leading-relaxed text-sm">
              IssueFace는 같은 이슈를 두 국가의 뉴스가 어떤 논조와 표현으로 다루는지 비교하는 서비스입니다.
              감정 점수, 핵심 보도 표현, 국가별 캐릭터와 상호작용 이미지를 통해 보도 프레임의 차이를 시각적으로 보여줍니다.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold text-ink mb-3">어떻게 분석하나요?</h2>
            <ul className="space-y-3 text-sm">
              {[
                ['Currents News API', '국가와 주제에 맞는 최신 뉴스 기사를 수집합니다.'],
                ['Google Natural Language API', '기사 제목과 설명을 분석해 -5~+5 범위의 감정 점수로 변환합니다.'],
                ['비교 시각화', '국가별 논조, 핵심 보도 표현, 신뢰도, 캐릭터 상호작용을 한 화면에서 비교합니다.'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <div>
                    <span className="font-semibold text-ink">{title}:</span>{' '}
                    <span>{desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-parchment border border-border rounded-sm p-4 text-xs text-muted leading-relaxed">
            <strong>주의사항:</strong> 이 분석은 여론조사가 아니라 언론 보도 데이터 기반의 자동 분석입니다.
            실제 국가 여론이나 정부 입장과 다를 수 있습니다.
          </div>
        </div>

        <div className="mt-10">
          <Link to="/" className="btn-primary inline-block">
            홈으로
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Introduction;
