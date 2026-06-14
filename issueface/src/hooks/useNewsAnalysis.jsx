import { useState } from 'react';

// ── 주제 한→영 번역 맵 ───────────────────────────────────────────
const TOPIC_MAP = {
  '가자 이스라엘-팔레스타인': 'Gaza Israel Palestine',
  '대만-중국 안보': 'Taiwan Strait tensions',
  '이민/난민 문제': 'immigration refugees',
  '안락사': 'euthanasia',
  '아마존 개발': 'Amazon rainforest deforestation soy',
  'AI': 'AI artificial intelligence',
  '전쟁': 'war military conflict',
  '경제': 'economy trade',
  '환경': 'environment climate',
  '반도체': 'semiconductor chip',
  '탄소중립': 'carbon neutral net zero',
  '이란-미국 전쟁': 'Iran US war',
  '지구온난화': 'global warming climate',
  '인공지능': 'AI artificial intelligence',
  '무역': 'trade tariff',
  '외교': 'diplomacy foreign policy',
  '핵': 'nuclear',
  '우크라이나': 'Ukraine war Russia',
  '중동': 'Middle East conflict',
};

function translateTopic(topic) {
  // 맵에 있으면 영어로 변환, 없으면 그대로 사용 (이미 영어인 경우)
  return TOPIC_MAP[topic] || topic;
}

// ── 감성 키워드 사전 ──────────────────────────────────────────────
const POSITIVE_WORDS = [
  'growth','improve','rise','gain','record','success','advance','boost','surge',
  'strong','positive','recovery','benefit','opportunity','achieve','win','peace',
  'agreement','deal','cooperation','progress','profit','expand','support','open',
  'increase','best','great','good','hope','stable','safe','secure','ally','invest',
  'relief','celebrate','praise','approve','welcome','sign','launch','develop',
];
const NEGATIVE_WORDS = [
  'war','conflict','crisis','threat','attack','fail','loss','collapse','decline',
  'tension','sanction','protest','crash','recession','murder','death','disaster',
  'bomb','missile','strike','violence','kill','defeat','ban','restrict','cut',
  'risk','warn','fear','concern','damage','terror','invasion','dispute','condemn',
  'accuse','arrest','casualt','wound','flee','suffer','explosion','shooting',
  'hunger','poverty','drought','flood','earthquake','outbreak','disease',
];

function scoreTone(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach((w) => { if (lower.includes(w)) score += 1; });
  NEGATIVE_WORDS.forEach((w) => { if (lower.includes(w)) score -= 1; });
  return score;
}

function calcTone(articles) {
  if (!articles.length) return 0;
  const total = articles.reduce((s, a) =>
    s + scoreTone((a.title || '') + ' ' + (a.description || '')), 0
  );
  const avg = total / articles.length;
  return parseFloat(Math.max(-5, Math.min(5, avg * 1.2)).toFixed(2));
}

function extractKeywords(articles, topN = 5) {
  const stopwords = new Set([
    'the','a','an','in','of','to','and','is','for','on','at','by','as','it',
    'its','be','are','was','were','has','have','had','will','with','this','that',
    'from','or','but','not','he','she','they','we','you','says','said','new',
    'after','over','amid','into','up','than','more','their','been','also',
    'would','could','should','about','before','between','against','during',
    'over','just','even','when','then','here','there','what','which','who',
  ]);
  const freq = {};
  articles.forEach((a) => {
    const text = ((a.title || '') + ' ' + (a.description || '')).toLowerCase();
    text.replace(/[^a-z가-힣\s]/g, '').split(/\s+/).forEach((w) => {
      if (w.length > 3 && !stopwords.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([w]) => w);
}

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
  {
    type: '경제',
    patterns: [
      /\btrade\s+\w+(?:\s+\w+){0,3}/gi,
      /\bmarket\s+\w+(?:\s+\w+){0,3}/gi,
      /\bfinance\s+\w+(?:\s+\w+){0,3}/gi,
      /\binvest(?:s|ed|ing|ment)?\s+\w*(?:\s+\w+){0,3}/gi,
    ],
  },
  {
    type: '환경',
    patterns: [
      /\bdeforestation\s+\w*(?:\s+\w+){0,3}/gi,
      /\brainforest\s+\w+(?:\s+\w+){0,3}/gi,
      /\bclimate\s+\w+(?:\s+\w+){0,3}/gi,
      /\benvironment(?:al)?\s+\w+(?:\s+\w+){0,3}/gi,
    ],
  },
];

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

function getArticleSourceText(article) {
  return [
    article.title,
    article.description,
    article.content,
    article.snippet,
  ].filter(Boolean).join('. ');
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

function getSentimentLabel(tone) {
  if (tone <= -0.3) return '\uBD80\uC815\uC801';
  if (tone >= 0.3) return '\uAE0D\uC815\uC801';
  return '\uC911\uB9BD\uC801';
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
  if (diff < 0.3) return `${c1}과 ${c2} 모두 "${topic}"에 대해 유사한 논조를 보입니다.`;
  const more = t1 > t2 ? c1 : c2;
  const less = t1 > t2 ? c2 : c1;
  return `"${topic}" 이슈에 대해 ${more} 관련 뉴스가 ${less}보다 ${diff}점 더 긍정적인 논조를 보입니다.`;
}

// ── Google News RSS → rss2json (키 없음) ─────────────────────────
async function fetchGoogleNews(countryNameEn, topicEn) {
  // 영어 국가명 + 영어 주제로 검색
  const query = encodeURIComponent(`${countryNameEn} ${topicEn}`);
  const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en&gl=US&ceid=US:en`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`rss2json ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('rss2json error: ' + data.message);

    return (data.items || []).slice(0, 15).map((item) => ({
      title: item.title,
      description: item.description?.replace(/<[^>]*>/g, '') || '',
      content: item.content?.replace(/<[^>]*>/g, '') || '',
      snippet: item.contentSnippet || item.snippet || '',
      url: item.link,
      pubDate: item.pubDate,
    }));
  } catch (e) {
    console.warn(`Google News fetch 실패 (${countryNameEn}):`, e.message);
    return [];
  }
}

// ── Hook ─────────────────────────────────────────────────────────
function useNewsAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async ({
    country1, country2,
    country1Name, country2Name,
    country1NameEn, country2NameEn,
    topic,
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // 주제를 영어로 변환
    const topicEn = translateTopic(topic);

    try {
      const [articles1, articles2] = await Promise.all([
        fetchGoogleNews(country1NameEn, topicEn),
        fetchGoogleNews(country2NameEn, topicEn),
      ]);

      const has1 = articles1.length > 0;
      const has2 = articles2.length > 0;
      const tone1 = calcTone(articles1);
      const tone2 = calcTone(articles2);

      // 기사별 tone 점수 추가 (분포 차트용)
      const tagArticles = (articles) => articles.map((a) => ({
        ...a,
        toneScore: scoreTone((a.title || '') + ' ' + (a.description || '')),
      }));
      const tagged1 = tagArticles(articles1);
      const tagged2 = tagArticles(articles2);
      const keyPhrases1 = extractKeyPhrases(articles1);
      const keyPhrases2 = extractKeyPhrases(articles2);

      setResult({
        country1: has1 ? {
          tone: tone1,
          sentiment: getSentimentLabel(tone1),
          keywords: extractKeywords(articles1),
          keyPhrases: keyPhrases1,
          frameSummary: buildFrameSummary(country1Name, keyPhrases1),
          summary: buildSummary(country1Name, topic, tone1, articles1.length),
          topNews: articles1.slice(0, 3).map((a) => ({ title: a.title, url: a.url })),
          articleCount: articles1.length,
          allArticles: tagged1,
          hasData: true,
        } : { hasData: false, articleCount: 0, allArticles: [], keyPhrases: [] },

        country2: has2 ? {
          tone: tone2,
          sentiment: getSentimentLabel(tone2),
          keywords: extractKeywords(articles2),
          keyPhrases: keyPhrases2,
          frameSummary: buildFrameSummary(country2Name, keyPhrases2),
          summary: buildSummary(country2Name, topic, tone2, articles2.length),
          topNews: articles2.slice(0, 3).map((a) => ({ title: a.title, url: a.url })),
          articleCount: articles2.length,
          allArticles: tagged2,
          hasData: true,
        } : { hasData: false, articleCount: 0, allArticles: [], keyPhrases: [] },

        comparison: buildComparison(country1Name, country2Name, tone1, tone2, topic, has1, has2),
        comparisonFrameSummary: buildComparisonFrameSummary(country1Name, country2Name, keyPhrases1, keyPhrases2, has1, has2),
        country1Code: country1,
        country2Code: country2,
        country1Name,
        country2Name,
        topic,
        analyzedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('분석 오류:', err);
      setError('뉴스 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return { analyze, result, loading, error };
}

export default useNewsAnalysis;
