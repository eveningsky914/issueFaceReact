import React from 'react';
import { getInteractionImage } from '../../utils/interactionImages';

function getDiffColorClass(value) {
  if (value >= 0.3) return 'text-green-800';
  if (value <= -0.3) return 'text-accent';
  return 'text-navy';
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
    <section className="relative overflow-hidden rounded-sm border border-border bg-[#e4e2e2] shadow-sm">
      <div
        className={`relative grid grid-cols-1 gap-4 p-5 md:p-6 ${
          hasInteractionImage
            ? 'min-h-[360px] md:grid-cols-[0.72fr_1.5fr_0.68fr]'
            : 'md:grid-cols-[1fr_0.72fr]'
        }`}
      >
        <div className="flex flex-col justify-center">
          <p className="font-body text-xs font-bold tracking-wide text-accent">
            {heroData.eyebrow}
          </p>
          <h1 className="mt-6 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
            {heroData.title}
          </h1>
          <div className="mt-6 space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-muted">◷</span>
              <span className="section-label">분석 시간</span>
              <span className="font-mono text-sm text-ink">{heroData.analyzedAtText}</span>
            </div>
          </div>
        </div>

        {hasInteractionImage && (
          <div className="flex min-h-[240px] items-end justify-center">
            <img
              src={interactionImage}
              alt={`${heroData.normalizedPairKey} 캐릭터 상호작용`}
              className="block max-h-[330px] w-full object-contain object-bottom"
            />
          </div>
        )}

        <div className="flex items-center justify-center md:justify-end">
          <div className="relative w-full max-w-[240px] border border-border bg-cream/85 p-5 shadow-sm">
            <div className="absolute -top-3 left-5 h-8 w-3 rounded-full border border-muted bg-cream" />
            <p className="font-body text-xs font-bold text-ink">
              {heroData.diffLabel}
            </p>
            <p className={`mt-5 font-mono text-4xl font-bold leading-none ${getDiffColorClass(heroData.diffValue)}`}>
              {heroData.diffText}
            </p>
            <p className="mt-4 font-body text-sm leading-relaxed text-navy">
              {diffSummary}
            </p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border bg-cream/70 p-4 md:mx-5 md:mb-5 md:rounded-sm md:border">
        <p className="section-label mb-2 text-accent">분석 요약</p>
        <p className="font-body text-sm leading-relaxed text-ink">
          {heroData.reactionSummary}
        </p>
      </div>
    </section>
  );
}

export default ResultHero;
