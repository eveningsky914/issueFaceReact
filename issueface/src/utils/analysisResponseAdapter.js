import { extractKeyPhrases } from './keyPhraseExtractor';

function getSentimentLabel(tone) {
  if (tone <= -0.3) return '부정적';
  if (tone >= 0.3) return '긍정적';
  return '중립적';
}

function buildFrameSummary(countryName, keyPhrases) {
  if (!keyPhrases.length) return null;
  const types = [...new Set(keyPhrases.map((phrase) => phrase.type))].slice(0, 3);
  const examples = keyPhrases.slice(0, 2).map((phrase) => `"${phrase.text}"`).join(', ');
  return `${countryName} 관련 보도는 ${types.join(', ')} 성격의 표현을 중심으로 이슈를 다루며, ${examples} 같은 프레임이 나타납니다.`;
}

function buildComparisonFrameSummary(c1Name, c2Name, phrases1, phrases2, has1, has2) {
  if (!has1 || !has2 || (!phrases1.length && !phrases2.length)) return null;
  const p1 = phrases1.slice(0, 2).map((phrase) => `"${phrase.text}"`).join(', ') || '뚜렷한 주장 표현 없음';
  const p2 = phrases2.slice(0, 2).map((phrase) => `"${phrase.text}"`).join(', ') || '뚜렷한 주장 표현 없음';
  return `${c1Name} 관련 보도는 ${p1} 표현에 드러나고, ${c2Name} 관련 보도는 ${p2} 표현을 통해 이슈를 설명합니다.`;
}

function buildSummary(countryName, topic, tone, count) {
  if (count === 0) return null;
  const label = getSentimentLabel(tone);
  return `${countryName} 관련 "${topic}" 뉴스 ${count}건 분석 결과, ${label} 논조(Tone ${tone >= 0 ? '+' : ''}${tone})를 보입니다.`;
}

function buildComparison(c1, c2, t1, t2, topic, has1, has2) {
  if (!has1 && !has2) return `"${topic}"에 대해 두 나라의 뉴스를 찾을 수 없습니다.`;
  if (!has1) return `${c2} 관련 "${topic}" 뉴스만 수집되었습니다.`;
  if (!has2) return `${c1} 관련 "${topic}" 뉴스만 수집되었습니다.`;

  const diff = Math.abs(t1 - t2).toFixed(2);
  if (Number(diff) < 0.3) return `${c1}과 ${c2} 모두 "${topic}"에 대해 유사한 논조를 보입니다.`;

  const more = t1 > t2 ? c1 : c2;
  const less = t1 > t2 ? c2 : c1;
  return `"${topic}" 이슈에 대해 ${more} 관련 뉴스가 ${less}보다 ${diff}점 더 긍정적인 논조를 보입니다.`;
}

function adaptCountryResult(apiCountry, fallbackName, topic) {
  const articles = apiCountry?.articles || [];
  const tone = Number(apiCountry?.toneScore || 0);
  const hasData = articles.length > 0;
  const keyPhrases = extractKeyPhrases(articles);

  if (!hasData) {
    return {
      hasData: false,
      articleCount: 0,
      allArticles: [],
      keyPhrases: [],
    };
  }

  return {
    tone,
    sentiment: apiCountry?.toneLabel || getSentimentLabel(tone),
    keywords: apiCountry?.topKeywords || [],
    keyPhrases,
    frameSummary: buildFrameSummary(fallbackName, keyPhrases),
    summary: buildSummary(fallbackName, topic, tone, articles.length),
    topNews: articles.slice(0, 3).map((article) => ({
      title: article.title,
      url: article.url,
    })),
    articleCount: articles.length,
    allArticles: articles.map((article) => ({
      ...article,
      toneScore: Number(article.toneScore || 0),
    })),
    toneDistribution: apiCountry?.toneDistribution,
    sentenceSentiments: apiCountry?.sentenceSentiments || [],
    hasData: true,
  };
}

export function adaptAnalysisResponse(apiResult, request) {
  const country1 = adaptCountryResult(apiResult.country1, request.country1Name, request.topic);
  const country2 = adaptCountryResult(apiResult.country2, request.country2Name, request.topic);
  const has1 = Boolean(country1.hasData);
  const has2 = Boolean(country2.hasData);
  const tone1 = has1 ? country1.tone : 0;
  const tone2 = has2 ? country2.tone : 0;

  return {
    country1,
    country2,
    comparison: buildComparison(request.country1Name, request.country2Name, tone1, tone2, request.topic, has1, has2),
    comparisonFrameSummary: buildComparisonFrameSummary(
      request.country1Name,
      request.country2Name,
      country1.keyPhrases || [],
      country2.keyPhrases || [],
      has1,
      has2
    ),
    country1Code: request.country1,
    country2Code: request.country2,
    country1Name: request.country1Name,
    country2Name: request.country2Name,
    topic: request.topic,
    analyzedAt: new Date().toISOString(),
  };
}
