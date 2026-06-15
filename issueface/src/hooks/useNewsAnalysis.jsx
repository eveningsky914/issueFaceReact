import { useState } from 'react';
import { analyzeNews } from '../services/newsAnalysisApi';

const PHRASE_RULES = [
  {
    type: '전망',
    patterns: [
      /\bmay\s+\w+(?:\s+\w+){0,4}/gi,
      /\bcould\s+\w+(?:\s+\w+){0,4}/gi,
      /\blikely\s+to\s+\w+(?:\s+\w+){0,3}/gi,
      /\bexpected\s+to\s+\w+(?:\s+\w+){0,3}/gi,
      /\bset\s+to\s+\w+(?:\s+\w+){0,3}/gi,
    ],
  },
  {
    type: '우려',
    patterns: [
      /\b\w+\s+under\s+threat\b/gi,
      /\bunder\s+threat\b/gi,
      /\bat\s+risk\b/gi,
      /\brisk(?:s|ed|ing)?\s+\w+(?:\s+\w+){0,3}/gi,
      /\bconcerns?\s+(?:over|about)\s+\w+(?:\s+\w+){0,3}/gi,
      /\bfears?\s+\w+(?:\s+\w+){0,3}/gi,
    ],
  },
  {
    type: '비판',
    patterns: [
      /\b\w+(?:\s+\w+){0,2}\s+is\s+collapsing\b/gi,
      /\bcollaps(?:e|es|ed|ing)\s+\w*(?:\s+\w+){0,3}/gi,
      /\bcriticiz(?:e|es|ed|ing)\s+\w+(?:\s+\w+){0,3}/gi,
      /\baccus(?:e|es|ed|ing)\s+\w+(?:\s+\w+){0,3}/gi,
      /\babandon(?:s|ed|ing)?\s+\w+(?:\s+\w+){0,3}/gi,
      /\bfail(?:s|ed|ing)?\s+\w+(?:\s+\w+){0,3}/gi,
      /\bweaken(?:s|ed|ing)?\s+\w+(?:\s+\w+){0,3}/gi,
    ],
  },
  {
    type: '옹호',
    patterns: [
      /\bmust\s+be\s+defended\b/gi,
      /\bmust\s+\w+(?:\s+\w+){0,4}/gi,
      /\bshould\s+\w+(?:\s+\w+){0,4}/gi,
      /\bneeds?\s+to\s+\w+(?:\s+\w+){0,3}/gi,
      /\bcalls?\s+for\s+\w+(?:\s+\w+){0,3}/gi,
      /\burges?\s+\w+(?:\s+\w+){0,3}/gi,
      /\bdefend(?:s|ed|ing)?\s+\w*(?:\s+\w+){0,3}/gi,
      /\bprotect(?:s|ed|ing|ion)?\s+\w*(?:\s+\w+){0,3}/gi,
      /\bsafeguard(?:s|ed|ing)?\s+\w*(?:\s+\w+){0,3}/gi,
      /\bpreserv(?:e|es|ed|ing)\s+\w+(?:\s+\w+){0,3}/gi,
    ],
  },
  {
    type: '갈등',
    patterns: [
      /\bconflict\s+(?:with|over|between)\s+\w+(?:\s+\w+){0,3}/gi,
      /\bclash(?:es|ed|ing)?\s+(?:with|over)?\s*\w+(?:\s+\w+){0,3}/gi,
      /\btensions?\s+(?:over|between|with)\s+\w+(?:\s+\w+){0,3}/gi,
    ],
  },
  {
    type: '변화',
    patterns: [
      /\bleads?\s+to\s+\w+(?:\s+\w+){0,3}/gi,
      /\bclear\s+way\s+for\s+\w+(?:\s+\w+){0,3}/gi,
      /\bpush(?:es)?\s+for\s+\w+(?:\s+\w+){0,3}/gi,
      /\brise(?:s|n)?\s+\w*(?:\s+\w+){0,3}/gi,
      /\bfall(?:s|en)?\s+\w*(?:\s+\w+){0,3}/gi,
      /\bexit\s+historic\s+pact\b/gi,
    ],
  },
];

function getSentimentLabel(tone) {
  if (tone <= -0.3) return '부정적';
  if (tone >= 0.3) return '긍정적';
  return '중립적';
}

function cleanPhrase(phrase) {
  return phrase
    .replace(/<[^>]*>/g, ' ')
    .replace(/[“”"()[\]{}]/g, '')
    .replace(/[,:;.!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ');
}

function normalizePhrase(phrase) {
  return phrase.toLowerCase().replace(/[^a-z0-9가-힣\s]/g, '').replace(/\s+/g, ' ').trim();
}

function extractKeyPhrases(articles, topN = 5) {
  const candidates = [];

  articles.forEach((article, articleIndex) => {
    const fields = [
      { text: article.title, priority: 4 },
      { text: article.description, priority: 3 },
      { text: article.content, priority: 2 },
      { text: article.snippet, priority: 2 },
    ].filter((field) => field.text);

    fields.forEach(({ text, priority }) => {
      const source = text.replace(/ - [^-]{2,80}$/g, ' ');
      PHRASE_RULES.forEach((rule, ruleIndex) => {
        rule.patterns.forEach((pattern) => {
          const matches = source.matchAll(pattern);
          for (const match of matches) {
            const phrase = cleanPhrase(match[0]);
            const wordCount = phrase.split(/\s+/).filter(Boolean).length;
            if (wordCount < 2 || wordCount > 6) continue;
            candidates.push({
              text: phrase,
              type: rule.type,
              score: priority * 10 + (PHRASE_RULES.length - ruleIndex) + Math.max(0, 6 - wordCount) - articleIndex * 0.2,
            });
          }
        });
      });
    });
  });

  const unique = new Map();
  candidates
    .sort((a, b) => b.score - a.score)
    .forEach((candidate) => {
      const key = normalizePhrase(candidate.text);
      if (!key || unique.has(key)) return;
      unique.set(key, { text: candidate.text, type: candidate.type });
    });

  return [...unique.values()].slice(0, topN);
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
  return `${c1Name} 관련 보도는 ${p1} 표현이 두드러지고, ${c2Name} 관련 보도는 ${p2} 표현을 통해 이슈를 설명합니다.`;
}

function buildSummary(countryName, topic, tone, count) {
  if (count === 0) return null;
  const label = getSentimentLabel(tone);
  return `${countryName} 관련 "${topic}" 뉴스 ${count}건 분석 결과, ${label}인 논조(Tone ${tone >= 0 ? '+' : ''}${tone})를 보입니다.`;
}

function buildComparison(c1, c2, t1, t2, topic, has1, has2) {
  if (!has1 && !has2) return `"${topic}"에 대한 두 나라의 뉴스를 찾을 수 없습니다.`;
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

function adaptAnalysisResponse(apiResult, request) {
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

function useNewsAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async ({
    country1,
    country2,
    country1Name,
    country2Name,
    topic,
    topicId = '',
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const request = {
      country1,
      country2,
      country1Name,
      country2Name,
      topic,
    };

    try {
      const apiResult = await analyzeNews({
        country1,
        country2,
        keyword: topic,
        topicId: topicId || '',
      });
      setResult(adaptAnalysisResponse(apiResult, request));
    } catch (err) {
      console.error('분석 오류:', err);
      setError(err.message || '뉴스 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return { analyze, result, loading, error };
}

export default useNewsAnalysis;
