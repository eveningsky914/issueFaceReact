const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const BACKUP_NEWS = require('./backupNews');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 4000;
const ARTICLE_LIMIT = 10;
const TARGET_ARTICLE_COUNT = 5;
const CURRENTS_PAGE_NUMBER = 1;
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
  gaza_israel_palestine: {
    label: '이스라엘-팔레스타인',
    shortKeyword: 'Gaza',
    queries: {
      ko: '가자지구 이스라엘 하마스 휴전',
      en: 'Gaza Israel Hamas ceasefire',
      pt: 'Gaza Israel Hamas cessar-fogo',
      ja: 'ガザ イスラエル ハマス 停戦',
      zh: '加沙 以色列 哈马斯 停火',
      id: 'Gaza Israel Hamas gencatan senjata',
      ar: 'غزة إسرائيل حماس وقف إطلاق النار',
    },
  },
  taiwan_strait_tensions: {
    label: '대만-중국 분쟁',
    shortKeyword: 'Taiwan',
    queries: {
      ko: '대만해협 중국 군사훈련',
      en: 'Taiwan Strait China military drills',
      pt: 'Estreito de Taiwan China exercícios militares',
      ja: '台湾海峡 中国 軍事演習',
      zh: '台海 中国 军演',
      id: 'Selat Taiwan China latihan militer',
      ar: 'مضيق تايوان الصين مناورات عسكرية',
    },
  },
  immigration_refugees: {
    label: '이민/난민 문제',
    shortKeyword: 'immigration',
    queries: {
      ko: '이민 난민 국경 정책',
      en: 'immigration refugees border policy',
      pt: 'imigração refugiados política de fronteira',
      ja: '移民 難民 国境政策',
      zh: '移民 难民 边境政策',
      id: 'imigrasi pengungsi kebijakan perbatasan',
      ar: 'الهجرة اللاجئون سياسة الحدود',
    },
  },
  euthanasia: {
    label: '안락사',
    shortKeyword: 'euthanasia',
    queries: {
      ko: '안락사 조력사망 법안',
      en: 'euthanasia assisted dying bill',
      pt: 'eutanásia morte assistida projeto de lei',
      ja: '安楽死 assisted dying 法案',
      zh: '安乐死 协助死亡 法案',
      id: 'eutanasia kematian berbantuan RUU',
      ar: 'القتل الرحيم الموت بمساعدة مشروع قانون',
    },
  },
  amazon_development: {
    label: '아마존 개발',
    shortKeyword: 'Amazon rainforest',
    queries: {
      ko: '아마존 열대우림 벌채 개발',
      en: 'Amazon rainforest deforestation development',
      pt: 'Amazônia desmatamento desenvolvimento',
      ja: 'アマゾン熱帯雨林 森林破壊 開発',
      zh: '亚马逊雨林 砍伐 开发',
      id: 'hutan hujan Amazon deforestasi pembangunan',
      ar: 'غابات الأمازون إزالة الغابات التنمية',
    },
  },
};

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

function findPresetTopic(topicId) {
  if (topicId && PRESET_TOPICS[topicId]) return PRESET_TOPICS[topicId];
  return null;
}

function getSearchKeyword({ keyword, topicId, language, fallbackLanguage, country }) {
  const preset = findPresetTopic(topicId);
  const lang = fallbackLanguage || language;

  if (preset?.queries?.[lang]) return preset.queries[lang];
  if (preset?.queries?.en) return preset.queries.en;
  return stripCountryPrefix(keyword, country);
}

function getShortSearchKeyword({ keyword, topicId }) {
  const preset = findPresetTopic(topicId);
  if (preset?.shortKeyword) return preset.shortKeyword;

  const cleanKeyword = String(keyword || '').trim();
  const words = cleanKeyword.split(/\s+/).filter(Boolean);
  if (words.length > 1) return words[0];

  const chars = Array.from(cleanKeyword);
  if (chars.length > 2 && /[^\x00-\x7F]/.test(cleanKeyword)) {
    return chars.slice(0, 2).join('');
  }

  return cleanKeyword;
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
  const canUseOnlyBackup = hasBackupArticles(topicId, country1) && hasBackupArticles(topicId, country2);

  if (!process.env.CURRENTS_API_KEY && !canUseOnlyBackup) return 'CURRENTS_API_KEY is missing.';
  if (!process.env.GOOGLE_NL_API_KEY) return 'GOOGLE_NL_API_KEY is missing.';
  if (!country1 || !country2) return 'country1 and country2 are required.';
  if (country1 === country2) return 'country1 and country2 must be different.';
  if (!keyword && !topicId) return 'keyword or topicId is required.';
  if (!COUNTRIES[country1] || !COUNTRIES[country2]) return 'Unsupported country code.';
  return null;
}

function normalizeArticle(article) {
  return {
    ...article,
    title: article.title || '',
    description: article.description || '',
    url: article.url || article.link || '',
    published: article.published || article.publishedAt || '',
    image: article.image || '',
    source: article.author || article.source || '',
  };
}

function getBackupArticles(topicId, countryCode) {
  return BACKUP_NEWS?.[topicId]?.[countryCode] || [];
}

function hasBackupArticles(topicId, countryCode) {
  return getBackupArticles(topicId, countryCode).length > 0;
}

function buildTextForSentiment(article) {
  return [article.title, article.description].filter(Boolean).join('. ').slice(0, 12000);
}

function getArticleKey(article) {
  const url = String(article.url || '').trim().toLowerCase();
  if (url) return `url:${url}`;

  const title = String(article.title || '').trim().toLowerCase();
  const source = String(article.source || '').trim().toLowerCase();
  return `title:${title}|source:${source}`;
}

function addUniqueArticles(target, articles, seenKeys, limit = ARTICLE_LIMIT) {
  let added = 0;

  articles.forEach((article) => {
    if (target.length >= limit) return;
    const key = getArticleKey(article);
    if (!key || seenKeys.has(key)) return;
    seenKeys.add(key);
    target.push(article);
    added += 1;
  });

  return added;
}

async function fetchNewsForCountry({
  country,
  keywords,
  language,
  includeCountry = true,
  tryNumber,
  pageNumber = 1,
}) {
  const url = new URL(CURRENTS_URL);
  url.searchParams.set('apiKey', process.env.CURRENTS_API_KEY);
  url.searchParams.set('keywords', keywords);
  url.searchParams.set('page_number', String(pageNumber));
  url.searchParams.set('page_size', String(ARTICLE_LIMIT));

  if (includeCountry && country?.code) {
    url.searchParams.set('country', country.code);
  }

  if (language) {
    url.searchParams.set('language', language);
  }

  const countryLog = includeCountry && country?.code ? country.code : '(none)';
  const languageLog = language || '(none)';
  console.log('[Currents try ' + tryNumber + '] page=' + pageNumber + ' country=' + countryLog + ' language=' + languageLog + ' keywords="' + keywords + '"');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Currents API failed: ' + response.status);
  }

  const data = await response.json();
  if (data.status && data.status !== 'ok') {
    throw new Error(data.message || 'Currents API returned an error.');
  }

  const articles = (data.news || []).slice(0, ARTICLE_LIMIT).map(normalizeArticle);
  console.log('[Currents try ' + tryNumber + '] page=' + pageNumber + ' result count=' + articles.length);
  return articles;
}

async function fetchNewsWithFallbacks({ country, keyword, topicId }) {
  const preset = findPresetTopic(topicId);
  const localizedQuery = getSearchKeyword({ keyword, topicId, language: country.language, country });
  const englishQuery = getSearchKeyword({ keyword, topicId, language: country.language, fallbackLanguage: 'en', country });
  const shortKeyword = getShortSearchKeyword({ keyword, topicId });
  const rawKeyword = preset ? stripCountryPrefix(keyword, country) : String(keyword || '').trim();

  const backupArticles = getBackupArticles(topicId, country.code);
  if (backupArticles.length > 0) {
    console.log('[Backup news] topic=' + topicId + ' country=' + country.code + ' count=' + backupArticles.length);
    return {
      articles: backupArticles.slice(0, ARTICLE_LIMIT).map(normalizeArticle),
      searchKeyword: localizedQuery || englishQuery || rawKeyword,
      searchAttempts: [
        {
          try: 1,
          page: null,
          country: country.code,
          language: country.language,
          keywords: localizedQuery || englishQuery || rawKeyword,
          resultCount: backupArticles.length,
          uniqueResultCount: Math.min(backupArticles.length, ARTICLE_LIMIT),
          uniqueAddedToTotal: Math.min(backupArticles.length, ARTICLE_LIMIT),
          fallbackUsed: true,
          source: 'backup',
        },
      ],
      fallbackUsed: true,
    };
  }

  const presetAttempts = [
    { keywords: localizedQuery, language: country.language, includeCountry: true, fallbackUsed: false },
    { keywords: englishQuery, language: 'en', includeCountry: true, fallbackUsed: true },
    { keywords: shortKeyword || englishQuery, language: 'en', includeCountry: true, fallbackUsed: true },
  ];

  const directAttempts = [
    { keywords: rawKeyword, language: '', includeCountry: true, fallbackUsed: false },
    { keywords: shortKeyword || rawKeyword, language: '', includeCountry: true, fallbackUsed: true },
  ];

  const attempts = (preset ? presetAttempts : directAttempts).filter((attempt, index, attemptsList) =>
    attempt.keywords &&
    attemptsList.findIndex((item) =>
      item.keywords === attempt.keywords &&
      item.language === attempt.language &&
      item.includeCountry === attempt.includeCountry
    ) === index
  );

  const searchAttempts = [];
  const collectedArticles = [];
  const seenArticleKeys = new Set();
  let firstSearchKeyword = attempts[0]?.keywords || localizedQuery || englishQuery || rawKeyword;
  let usedFallback = false;

  for (const [index, attempt] of attempts.entries()) {
    const tryNumber = index + 1;
    const attemptArticles = [];
    const attemptSeenKeys = new Set();

    const articles = await fetchNewsForCountry({
      country,
      keywords: attempt.keywords,
      language: attempt.language,
      includeCountry: attempt.includeCountry,
      tryNumber,
      pageNumber: CURRENTS_PAGE_NUMBER,
    });

    const uniqueInAttempt = addUniqueArticles(attemptArticles, articles, attemptSeenKeys, ARTICLE_LIMIT);
    const uniqueAddedToTotal = addUniqueArticles(collectedArticles, articles, seenArticleKeys, ARTICLE_LIMIT);

    const attemptLog = {
      try: tryNumber,
      page: CURRENTS_PAGE_NUMBER,
      country: attempt.includeCountry ? country.code : null,
      language: attempt.language || null,
      keywords: attempt.keywords,
      resultCount: articles.length,
      uniqueResultCount: uniqueInAttempt,
      uniqueAddedToTotal,
      fallbackUsed: attempt.fallbackUsed,
    };
    searchAttempts.push(attemptLog);

    if (uniqueAddedToTotal > 0 && !firstSearchKeyword) {
      firstSearchKeyword = attempt.keywords;
    }

    if (uniqueAddedToTotal > 0 && attempt.fallbackUsed) {
      usedFallback = true;
    }

    if (collectedArticles.length >= TARGET_ARTICLE_COUNT) {
      break;
    }
  }

  return {
    articles: collectedArticles.slice(0, ARTICLE_LIMIT),
    searchKeyword: firstSearchKeyword || localizedQuery || englishQuery || rawKeyword,
    searchAttempts,
    fallbackUsed: usedFallback || searchAttempts.some((attempt) => attempt.fallbackUsed && attempt.uniqueAddedToTotal > 0),
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
  const fixedToneScore = Number(article.toneScore);
  if (Number.isFinite(fixedToneScore)) {
    return {
      ...article,
      toneScore: fixedToneScore,
      toneLabel: article.toneLabel || getToneLabel(fixedToneScore),
      sentenceSentiments: article.sentenceSentiments || [],
    };
  }

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`IssueFace API server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
