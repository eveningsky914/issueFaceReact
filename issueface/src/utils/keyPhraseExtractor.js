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

function cleanPhrase(phrase) {
  return phrase
    .replace(/<[^>]*>/g, ' ')
    .replace(/["'“”‘’()[\]{}]/g, '')
    .replace(/[,:;.!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ');
}

function normalizePhrase(phrase) {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractKeyPhrases(articles, topN = 5) {
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
