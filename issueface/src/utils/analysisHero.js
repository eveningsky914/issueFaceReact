export function getToneState(tone) {
  const value = Number(tone);

  if (!Number.isFinite(value)) return 'neutral';
  if (value >= 0.3) return 'positive';
  if (value <= -0.3) return 'negative';
  return 'neutral';
}

export function getToneStateLabel(tone) {
  const state = getToneState(tone);

  if (state === 'positive') return '긍정적';
  if (state === 'negative') return '부정적';
  return '중립적';
}

export function formatToneValue(tone) {
  const value = Number(tone);

  if (!Number.isFinite(value)) return '0.00';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`;
}

export function formatHeroDate(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function getCountryTone(countryData) {
  if (!countryData?.hasData) return 0;

  const tone = Number(countryData.tone);
  return Number.isFinite(tone) ? tone : 0;
}

function buildCountryHeroData({ code, name, data }) {
  const tone = getCountryTone(data);

  return {
    code,
    name: name || code,
    hasData: Boolean(data?.hasData),
    tone,
    toneText: formatToneValue(tone),
    toneState: getToneState(tone),
    toneLabel: getToneStateLabel(tone),
  };
}

function makeNormalizedPairKey(code1, code2) {
  return [code1, code2]
    .filter(Boolean)
    .map((code) => String(code).toUpperCase())
    .sort()
    .join('-');
}

function getInteractionType(state1, state2) {
  if (state1 === 'neutral' || state2 === 'neutral') return null;
  if (state1 === 'positive' && state2 === 'positive') return 'positive_positive';
  if (state1 === 'negative' && state2 === 'negative') return 'negative_negative';
  return 'positive_negative';
}

function buildToneDifferenceSummary(country1, country2, diff) {
  const absText = Math.abs(diff).toFixed(2);

  if (Math.abs(diff) < 0.01) {
    return '두 국가의 감정 반응은 큰 차이가 없습니다.';
  }

  if (diff > 0) {
    return `${country1.name} 관련 뉴스가 ${country2.name}보다 ${absText}점 더 긍정적인 반응을 보입니다.`;
  }

  return `${country2.name} 관련 뉴스가 ${country1.name}보다 ${absText}점 더 긍정적인 반응을 보입니다.`;
}

function buildHeroSummary(country1, country2) {
  if (!country1.hasData && !country2.hasData) {
    return '양국 모두 분석 가능한 뉴스 데이터가 충분하지 않습니다.';
  }

  if (!country1.hasData) {
    return `${country2.name} 관련 뉴스만 분석되었습니다.`;
  }

  if (!country2.hasData) {
    return `${country1.name} 관련 뉴스만 분석되었습니다.`;
  }

  return `${country1.name}은 ${country1.toneLabel}인 반응을 보이고 있으며, ${country2.name}은 ${country2.toneLabel}인 반응을 보이고 있습니다.`;
}

export function buildAnalysisHeroData(result, analyzedAt) {
  if (!result) return null;

  const country1 = buildCountryHeroData({
    code: result.country1Code,
    name: result.country1Name,
    data: result.country1,
  });
  const country2 = buildCountryHeroData({
    code: result.country2Code,
    name: result.country2Name,
    data: result.country2,
  });
  const toneDifference = country1.tone - country2.tone;
  const normalizedPairKey = makeNormalizedPairKey(country1.code, country2.code);
  const interactionType = getInteractionType(country1.toneState, country2.toneState);
  const resolvedAnalyzedAt = analyzedAt || result.analyzedAt || result.savedAt || new Date().toISOString();

  return {
    eyebrow: '국제 이슈 브리핑',
    title: `${country1.name} vs ${country2.name}`,
    topic: result.topic || '',
    analyzedAt: resolvedAnalyzedAt,
    analyzedAtText: formatHeroDate(resolvedAnalyzedAt),
    countries: {
      country1,
      country2,
    },
    state1: country1.toneState,
    state2: country2.toneState,
    reactionSummary: buildHeroSummary(country1, country2),
    diffValue: toneDifference,
    diffText: formatToneValue(Math.abs(toneDifference)),
    diffLabel: `감정 차이 (${country1.code || ''} - ${country2.code || ''})`,
    showInteraction: Boolean(interactionType),
    interactionType,
    normalizedPairKey,
    toneDifference: {
      value: toneDifference,
      text: formatToneValue(toneDifference),
      state: getToneState(toneDifference),
      label: getToneStateLabel(toneDifference),
      pairLabel: `${country1.code || ''} - ${country2.code || ''}`.trim(),
      summary: buildToneDifferenceSummary(country1, country2, toneDifference),
    },
    summary: result.comparison || buildHeroSummary(country1, country2),
    frameSummary: result.comparisonFrameSummary || '',
  };
}
