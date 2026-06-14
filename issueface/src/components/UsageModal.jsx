import React from 'react';

const steps = [
  { num: '01', title: '국가 선택', desc: '세계 지도에서 비교하고 싶은 두 국가를 클릭하거나, 오른쪽 패널의 드롭다운에서 직접 선택하세요.' },
  { num: '02', title: '이슈 선택', desc: 'AI, 전쟁, 경제, 환경, 반도체 등 분석하고 싶은 주제를 선택하거나 직접 입력하세요.' },
  { num: '03', title: '뉴스 분석', desc: '"뉴스 분석 시작" 버튼을 클릭하면 양국의 뉴스 감정 지수를 비교 분석합니다.' },
  { num: '04', title: '결과 확인', desc: 'Tone 점수, 연관어, 대표 뉴스, 감정 캐릭터 등 다양한 지표로 두 나라의 시각을 비교할 수 있어요.' },
];

function UsageModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-cream border border-border max-w-lg w-full rounded-sm shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-xl font-bold text-ink">사용법</h2>
          <button onClick={onClose} className="text-muted hover:text-ink text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-4">
              <span className="font-mono text-accent font-bold text-lg leading-none pt-0.5 shrink-0">{s.num}</span>
              <div>
                <p className="font-body font-semibold text-ink text-sm mb-1">{s.title}</p>
                <p className="font-body text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5">
          <p className="text-xs text-muted font-body bg-parchment border border-border rounded-sm px-3 py-2">
            ⚠️ 본 서비스의 데이터는 국민 여론조사가 아닌 언론 보도 데이터 기반입니다. 실제 국민 여론과 다를 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default UsageModal;
