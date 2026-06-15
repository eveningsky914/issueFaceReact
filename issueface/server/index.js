const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const ARTICLE_LIMIT = 10;
const CURRENTS_URL = 'https://api.currentsapi.services/v1/search';
const GOOGLE_NL_URL = 'https://language.googleapis.com/v1/documents:analyzeSentiment';

const COUNTRIES = {
  KR: { code: 'KR', nameKo: '한국', nameEn: 'South Korea', flag: 'KR', language: 'ko' },
  JP: { code: 'JP', nameKo: '일본', nameEn: 'Japan', flag: 'JP', language: 'ja' },
  US: { code: 'US', nameKo: '미국', nameEn: 'United States', flag: 'US', language: 'en' },
  CN: { code: 'CN', nameKo: '중국', nameEn: 'China', flag: 'CN', language: 'zh' },
  BR: { code: 'BR', nameKo: '브라질', nameEn: 'Brazil', flag: 'BR', language: 'pt' },
  ID: { code: 'ID', nameKo: '인도네시아', nameEn: 'Indonesia', flag: 'ID', language: 'id' },
  AU: { code: 'AU', nameKo: '호주', nameEn: 'Australia', flag: 'AU', language: 'en' },
  GB: { code: 'GB', nameKo: '영국', nameEn: 'United Kingdom', flag: 'GB', language: 'en' },
  EG: { code: 'EG', nameKo: '이집트', nameEn: 'Egypt', flag: 'EG', language: 'ar' },
};

const PRESET_TOPICS = {
  "gaza_israel_palestine": {
    "label": "가자 이스라엘-팔레스타인",
    "aliases": [
      "가자 이스라엘-팔레스타인",
      "Gaza Israel Palestine"
    ],
    "shortKeyword": "Gaza",
    "queries": {
      "ko": "가자 이스라엘 팔레스타인",
      "en": "Gaza Israel Palestine",
      "pt": "Gaza Israel Palestina",
      "ja": "ガザ イスラエル パレスチナ",
      "zh": "加沙 以色列 巴勒斯坦",
      "id": "Gaza Israel Palestina",
      "ar": "غزة إسرائيل فلسطين"
    }
  },
  "taiwan_strait_tensions": {
    "label": "대만-중국 안보",
    "aliases": [
      "대만-중국 안보",
      "대만-중국 갈등",
      "대만-중국 안보 Taiwan Strait tensions",
      "Taiwan Strait tensions"
    ],
    "shortKeyword": "Taiwan",
    "queries": {
      "ko": "대만 중국 안보 갈등",
      "en": "Taiwan Strait tensions",
      "pt": "tensões Estreito de Taiwan China",
      "ja": "台湾海峡 中国 安全保障",
      "zh": "台湾海峡 中国 安全",
      "id": "ketegangan Selat Taiwan China",
      "ar": "توترات مضيق تايوان الصين"
    }
  },
  "immigration_refugees": {
    "label": "이민/난민 문제",
    "aliases": [
      "이민/난민 문제",
      "이민·난민",
      "immigration refugees"
    ],
    "shortKeyword": "refugees",
    "queries": {
      "ko": "이민 난민 문제",
      "en": "immigration refugees",
      "pt": "imigração refugiados",
      "ja": "移民 難民 問題",
      "zh": "移民 难民 问题",
      "id": "imigrasi pengungsi",
      "ar": "الهجرة اللاجئون"
    }
  },
  "euthanasia": {
    "label": "안락사",
    "aliases": [
      "안락사",
      "euthanasia"
    ],
    "shortKeyword": "euthanasia",
    "queries": {
      "ko": "안락사",
      "en": "euthanasia",
      "pt": "eutanásia",
      "ja": "安楽死",
      "zh": "安乐死",
      "id": "eutanasia",
      "ar": "القتل الرحيم"
    }
  },
  "amazon_development": {
    "label": "아마존 개발",
    "aliases": [
      "아마존 개발",
      "아마존 환경",
      "Amazon rainforest deforestation soy",
      "Amazon development"
    ],
    "shortKeyword": "Amazon",
    "queries": {
      "ko": "아마존 개발 아마존 열대우림 벌채",
      "en": "Amazon rainforest deforestation",
      "pt": "Amazônia desmatamento floresta amazônica",
      "ja": "アマゾン 開発 森林破壊",
      "zh": "亚马逊 雨林 砍伐 开发",
      "id": "Amazon deforestasi hutan hujan",
      "ar": "الأمازون إزالة الغابات المطيرة"
    }
  },
  "ai_regulation": {
    "label": "AI 규제",
    "aliases": [
      "AI 규제",
      "AI",
      "AI regulation"
    ],
    "shortKeyword": "AI",
    "queries": {
      "ko": "AI 규제",
      "en": "AI regulation",
      "pt": "regulação IA",
      "ja": "AI 規制",
      "zh": "人工智能 监管",
      "id": "regulasi AI",
      "ar": "تنظيم الذكاء الاصطناعي"
    }
  }
};

function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[?/]/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function escapeRegExp(value) {
  return String(value).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

function stripCountryPrefix(value, country) {
  let text = String(value || '').trim();
  if (!text) return '';

  const countryNames = country
    ? [country.nameEn, country.nameKo, country.code]
    : Object.values(COUNTRIES).flatMap((item) => [item.nameEn, item.nameKo, item.code]);

  countryNames
    .filter(Boolean)
    .sort((a, b) => String(b).length - String(a).length)
    .forEach((name) => {
      text = text.replace(new RegExp('^' + escapeRegExp(name) + '(?:\\s+|[:/-]+\\s*)', 'i'), '').trim();
    });

  return text;
}

function findPresetTopic(topicId, keyword) {
  if (topicId && PRESET_TOPICS[topicId]) return PRESET_TOPICS[topicId];

  const normalized = normalizeSearchText(stripCountryPrefix(keyword || topicId));
  if (!normalized) return null;

  return Object.values(PRESET_TOPICS).find((topic) => {
    const candidates = [topic.label, ...(topic.aliases || [])].map(normalizeSearchText);
    return candidates.includes(normalized);
  }) || null;
}

function getSearchKeyword({ keyword, topicId, language, fallbackLanguage, country }) {
  const preset = findPresetTopic(topicId, keyword);
  const lang = fallbackLanguage || language;

  if (preset?.queries?.[lang]) return preset.queries[lang];
  if (preset?.queries?.en) return preset.queries.en;
  return stripCountryPrefix(keyword, country);
}

function getShortSearchKeyword({ keyword, topicId }) {
  const preset = findPresetTopic(topicId, keyword);
  if (preset?.shortKeyword) return preset.shortKeyword;
  const cleanKeyword = stripCountryPrefix(keyword);
  return cleanKeyword.split(/\s+/).find((word) => word.length >= 2) || cleanKeyword;
}

function toToneScore(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return 0;
  return Number(Math.max(-5, Math.min(5, value * 5)).toFixed(2));
}

function getToneType(toneScore) {
  if (toneScore >= 0.3) return 'positive';
  if (toneScore <= -0.3) return 'negative';
  return 'neutral';
}

function getToneLabel(toneScore) {
  const type = getToneType(toneScore);
  if (type === 'positive') return '\uAE0D\uC815\uC801';
  if (type === 'negative') return '\uBD80\uC815\uC801';
  return '\uC911\uB9BD\uC801';
}

function validateAnalyzeRequest({ country1, country2, keyword, topicId }) {
  if (!process.env.CURRENTS_API_KEY) return 'CURRENTS_API_KEY is missing.';
  if (!process.env.GOOGLE_NL_API_KEY) return 'GOOGLE_NL_API_KEY is missing.';
  if (!country1 || !country2) return 'country1 and country2 are required.';
  if (country1 === country2) return 'country1 and country2 must be different.';
  if (!keyword && !topicId) return 'keyword or topicId is required.';
  if (!COUNTRIES[country1] || !COUNTRIES[country2]) return 'Unsupported country code.';
  return null;
}

function normalizeArticle(article) {
  return {
    title: article.title || '',
    description: article.description || '',
    url: article.url || article.link || '',
    published: article.published || article.publishedAt || '',
    image: article.image || '',
    source: article.author || article.source || '',
  };
}

function buildTextForSentiment(article) {
  return [article.title, article.description].filter(Boolean).join('. ').slice(0, 12000);
}

async function fetchNewsForCountry({ country, keywords, language, includeCountry = true, tryNumber }) {
  const url = new URL(CURRENTS_URL);
  url.searchParams.set('apiKey', process.env.CURRENTS_API_KEY);
  url.searchParams.set('keywords', keywords);
  url.searchParams.set('page_number', '1');
  url.searchParams.set('page_size', String(ARTICLE_LIMIT));

  if (includeCountry && country?.code) {
    url.searchParams.set('country', country.code);
  }

  if (language) {
    url.searchParams.set('language', language);
  }

  const countryLog = includeCountry && country?.code ? country.code : '(none)';
  const languageLog = language || '(none)';
  console.log('[Currents try ' + tryNumber + '] country=' + countryLog + ' language=' + languageLog + ' keywords="' + keywords + '"');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Currents API failed: ' + response.status);
  }

  const data = await response.json();
  if (data.status && data.status !== 'ok') {
    throw new Error(data.message || 'Currents API returned an error.');
  }

  const articles = (data.news || []).slice(0, ARTICLE_LIMIT).map(normalizeArticle);
  console.log('[Currents try ' + tryNumber + '] result count=' + articles.length);
  return articles;
}

async function fetchNewsWithFallbacks({ country, keyword, topicId }) {
  const localizedQuery = getSearchKeyword({ keyword, topicId, language: country.language, country });
  const englishQuery = getSearchKeyword({ keyword, topicId, language: country.language, fallbackLanguage: 'en', country });
  const shortKeyword = getShortSearchKeyword({ keyword, topicId });
  const rawKeyword = stripCountryPrefix(keyword, country);
  const attempts = [
    { keywords: localizedQuery, language: country.language, includeCountry: true, fallbackUsed: false },
    { keywords: englishQuery, language: '', includeCountry: true, fallbackUsed: false },
    { keywords: shortKeyword || rawKeyword || englishQuery || localizedQuery, language: '', includeCountry: true, fallbackUsed: true },
    { keywords: localizedQuery || englishQuery || rawKeyword, language: country.language, includeCountry: false, fallbackUsed: true },
  ].filter((attempt, index, attemptsList) =>
    attempt.keywords &&
    attemptsList.findIndex((item) =>
      item.keywords === attempt.keywords &&
      item.language === attempt.language &&
      item.includeCountry === attempt.includeCountry
    ) === index
  );

  const searchAttempts = [];

  for (const [index, attempt] of attempts.entries()) {
    const tryNumber = index + 1;
    const articles = await fetchNewsForCountry({
      country,
      keywords: attempt.keywords,
      language: attempt.language,
      includeCountry: attempt.includeCountry,
      tryNumber,
    });

    const attemptLog = {
      try: tryNumber,
      country: attempt.includeCountry ? country.code : null,
      language: attempt.language || null,
      keywords: attempt.keywords,
      resultCount: articles.length,
      fallbackUsed: attempt.fallbackUsed,
    };
    searchAttempts.push(attemptLog);

    if (articles.length > 0) {
      return {
        articles,
        searchKeyword: attempt.keywords,
        searchAttempts,
        fallbackUsed: attempt.fallbackUsed || !attempt.includeCountry,
      };
    }
  }

  return {
    articles: [],
    searchKeyword: localizedQuery || englishQuery || rawKeyword,
    searchAttempts,
    fallbackUsed: searchAttempts.some((attempt) => attempt.fallbackUsed),
  };
}

async function requestGoogleSentiment({ text, language }) {
  const body = {
    document: {
      type: 'PLAIN_TEXT',
      content: text || ' ',
      language,
    },
    encodingType: 'UTF8',
  };

  const response = await fetch(GOOGLE_NL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-goog-api-key': process.env.GOOGLE_NL_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google NL API failed: ${response.status} ${detail}`);
  }

  return response.json();
}

async function analyzeSentiment({ text, language }) {
  if (!text.trim()) {
    return { score: 0, magnitude: 0, sentenceSentiments: [] };
  }

  try {
    return normalizeSentiment(await requestGoogleSentiment({ text, language }));
  } catch (error) {
    if (language) {
      return normalizeSentiment(await requestGoogleSentiment({ text, language: undefined }));
    }
    throw error;
  }
}

function normalizeSentiment(data) {
  const documentSentiment = data.documentSentiment || {};
  return {
    score: Number(documentSentiment.score) || 0,
    magnitude: Number(documentSentiment.magnitude) || 0,
    sentenceSentiments: (data.sentences || []).map((sentence) => {
      const score = toToneScore(sentence.sentiment?.score || 0);
      return {
        text: sentence.text?.content || '',
        score,
        rawScore: Number(sentence.sentiment?.score) || 0,
        magnitude: Number(sentence.sentiment?.magnitude) || 0,
        toneLabel: getToneLabel(score),
      };
    }),
  };
}

async function analyzeArticle(article, language) {
  try {
    const sentiment = await analyzeSentiment({ text: buildTextForSentiment(article), language });
    const toneScore = toToneScore(sentiment.score);
    return {
      ...article,
      toneScore,
      toneLabel: getToneLabel(toneScore),
      sentenceSentiments: sentiment.sentenceSentiments,
    };
  } catch (error) {
    console.warn(`Google sentiment fallback for article: ${error.message}`);
    return {
      ...article,
      toneScore: 0,
      toneLabel: getToneLabel(0),
      sentenceSentiments: [],
    };
  }
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'have', 'has', 'are', 'was',
  'were', 'will', 'about', 'after', 'over', 'into', 'their', 'news', 'says', 'said',
  'more', 'than', 'what', 'when', 'where', 'which', 'amid', 'could', 'would',
]);

function extractTopKeywords(articles, searchKeyword, limit = 5) {
  const freq = new Map();
  const baseWords = String(searchKeyword || '').toLowerCase().split(/\s+/);

  articles.forEach((article) => {
    const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    text
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !STOPWORDS.has(word) && !baseWords.includes(word))
      .forEach((word) => freq.set(word, (freq.get(word) || 0) + 1));
  });

  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word]) => word);
}

function calculateToneDistribution(articles) {
  const total = articles.length;
  const positive = articles.filter((article) => getToneType(article.toneScore) === 'positive').length;
  const negative = articles.filter((article) => getToneType(article.toneScore) === 'negative').length;
  const neutral = total - positive - negative;
  const ratio = (count) => (total ? Number(((count / total) * 100).toFixed(1)) : 0);

  return {
    positive,
    neutral,
    negative,
    total,
    positiveRatio: ratio(positive),
    neutralRatio: ratio(neutral),
    negativeRatio: ratio(negative),
    dominantTone: getDominantTone({ positive, neutral, negative, total }),
  };
}

function getDominantTone({ positive, neutral, negative, total }) {
  if (!total) return '\uB370\uC774\uD130 \uC5C6\uC74C';
  if (positive >= neutral && positive >= negative) return '\uAE0D\uC815\uC801';
  if (negative >= positive && negative >= neutral) return '\uBD80\uC815\uC801';
  return '\uC911\uB9BD\uC801';
}

async function analyzeCountry({ countryCode, keyword, topicId }) {
  const country = COUNTRIES[countryCode];
  const { articles, searchKeyword, searchAttempts, fallbackUsed } = await fetchNewsWithFallbacks({ country, keyword, topicId });
  const analyzedArticles = await Promise.all(articles.map((article) => analyzeArticle(article, country.language)));
  const toneScore = analyzedArticles.length
    ? Number((analyzedArticles.reduce((sum, article) => sum + article.toneScore, 0) / analyzedArticles.length).toFixed(2))
    : 0;
  const magnitude = Number(analyzedArticles.reduce((sum, article) => sum + Math.abs(article.toneScore), 0).toFixed(2));

  return {
    code: country.code,
    nameKo: country.nameKo,
    nameEn: country.nameEn,
    flag: country.flag,
    language: country.language,
    searchKeyword,
    searchAttempts,
    fallbackUsed,
    toneScore,
    toneMagnitude: magnitude,
    magnitude,
    toneLabel: getToneLabel(toneScore),
    articleCount: analyzedArticles.length,
    articles: analyzedArticles,
    topKeywords: extractTopKeywords(analyzedArticles, searchKeyword),
    toneDistribution: calculateToneDistribution(analyzedArticles),
    sentenceSentiments: analyzedArticles.flatMap((article) => article.sentenceSentiments || []),
  };
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'IssueFace API', message: 'Server is running' });
});

app.post('/api/analyze', async (req, res) => {
  const country1 = String(req.body.country1 || '').toUpperCase();
  const country2 = String(req.body.country2 || '').toUpperCase();
  const keyword = String(req.body.keyword || req.body.topic || '').trim();
  const topicId = String(req.body.topicId || '').trim();
  const validationError = validateAnalyzeRequest({ country1, country2, keyword, topicId });

  if (validationError) {
    res.status(400).json({ ok: false, message: validationError });
    return;
  }

  try {
    const [result1, result2] = await Promise.all([
      analyzeCountry({ countryCode: country1, keyword, topicId }),
      analyzeCountry({ countryCode: country2, keyword, topicId }),
    ]);

    res.json({ ok: true, keyword, topicId, country1: result1, country2: result2 });
  } catch (error) {
    console.error('Analysis failed:', error);
    res.status(500).json({ ok: false, message: 'Failed to analyze news.', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`IssueFace API server running on http://localhost:${PORT}`);
});
