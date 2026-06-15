import React from 'react';
import { getInteractionImage } from '../../utils/interactionImages';

function getDiffColorClass(value) {
  if (value >= 0.3) return 'text-green-800';
  if (value <= -0.3) return 'text-accent';
  return 'text-navy';
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 text-[#8a6f4d]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function ResultHero({ heroData }) {
  if (!heroData) return null;

  const interactionImage = heroData.showInteraction
    ? getInteractionImage(heroData.normalizedPairKey, heroData.interactionType)
    : null;
  const hasInteractionImage = Boolean(
    heroData.showInteraction &&
    heroData.interactionType &&
    interactionImage
  );
  const diffSummary = heroData.toneDifference?.summary || '';

  return (
    <section className="relative overflow-hidden border border-[#c8b89f] bg-[#f7f1e7] px-4 py-4 shadow-[0_2px_8px_rgba(58,43,24,0.07)] md:px-5">
      <div className="relative z-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <h1 className="font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
            {heroData.topic || heroData.title}
          </h1>

          <div className="flex items-center gap-2 self-start border border-[#d7cab8] bg-[#fbf6ed]/70 px-3 py-2 font-body text-sm text-[#6f604e]">
            <CalendarIcon />
            <span>{heroData.periodText || '최근 1개월'}</span>
          </div>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#8d806c]/45" />
          <div className="h-1.5 w-1.5 rotate-45 border border-[#8d806c] bg-[#f7f1e7]" />
          <div className="h-px flex-1 bg-[#8d806c]/45" />
        </div>

        <div
          className={`grid grid-cols-1 items-center gap-5 ${
            hasInteractionImage
              ? 'lg:grid-cols-[0.82fr_1.12fr_0.74fr]'
              : 'lg:grid-cols-[1fr_0.78fr]'
          }`}
        >
          <div className="min-w-0">
            <p className="inline-block border-b border-[#b8a98f] pb-1 font-body text-sm font-bold tracking-wide text-accent">
              {heroData.eyebrow}
            </p>
            <h2 className="mt-6 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
              {heroData.title}
            </h2>
            <div className="mt-5 border-t border-[#c8b89f] pt-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg text-[#8a6f4d]">◷</span>
                <span className="section-label">분석 시간</span>
                <span className="font-mono text-sm text-ink">{heroData.analyzedAtText}</span>
              </div>
            </div>
          </div>

          {hasInteractionImage && (
            <figure className="mx-auto w-full max-w-[430px] rounded-sm border border-[#b8a98f] bg-[#f3eadc] p-2 shadow-[0_3px_10px_rgba(58,43,24,0.10)]">
              <div className="bg-[#fbf6ed] p-1.5">
                <img
                  src={interactionImage}
                  alt={`${heroData.normalizedPairKey} 캐릭터 상호작용`}
                  className="block max-h-[340px] w-full object-contain"
                />
              </div>
            </figure>
          )}

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[280px] border border-[#b8a98f] bg-[#fbf6ed] px-5 py-5 shadow-[0_2px_8px_rgba(58,43,24,0.07)]">
              <p className="text-center font-body text-sm font-bold text-ink">
                {heroData.diffLabel}
              </p>
              <div className="my-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-[#b8a98f]" />
                <div className="h-1.5 w-1.5 rotate-45 bg-[#8a6f4d]" />
                <div className="h-px flex-1 bg-[#b8a98f]" />
              </div>
              <p className={`text-center font-mono text-4xl font-bold leading-none ${getDiffColorClass(heroData.diffValue)}`}>
                {heroData.diffText}
              </p>
              <p className="mt-5 font-body text-sm leading-relaxed text-navy">
                {diffSummary}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 border border-[#c8b89f] bg-[#fbf6ed]/75 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 border-b border-dashed border-[#c8b89f] pb-2">
            <span className="font-mono text-base text-[#8a6f4d]">□</span>
            <p className="section-label text-accent">분석 요약</p>
          </div>
          <p className="font-body text-sm leading-relaxed text-ink">
            {heroData.reactionSummary}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ResultHero;
