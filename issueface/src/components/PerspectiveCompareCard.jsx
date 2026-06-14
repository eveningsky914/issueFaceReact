import React from 'react';

const PERSPECTIVE_RULES = [
  { label: '외교적 중재', terms: ['diplomacy', 'diplomatic', 'mediate', 'mediation', 'broker', 'envoy'] },
  { label: '휴전 촉구', terms: ['ceasefire', 'truce', 'halt fighting', 'pause fighting'] },
  { label: '대화와 협상', terms: ['dialogue', 'negotiation', 'talks', 'deal', 'agreement'] },
  { label: '안보 위협', terms: ['security', 'threat', 'attack', 'defense', 'defence'] },
  { label: '인질 석방', terms: ['hostage', 'hostages', 'release captives', 'captives'] },
  { label: '군사 대응', terms: ['military', 'strike', 'operation', 'retaliation', 'troops'] },
  { label: '인도적 위기', terms: ['humanitarian', 'aid', 'famine', 'hunger', 'civilian', 'refugee'] },
  { label: '국제사회 비판', terms: ['criticize', 'condemn', 'accuse', 'international community', 'bias'] },
  { label: '정부 책임', terms: ['government', 'minister', 'president', 'administration', 'responsibility'] },
  { label: '테러 위협', terms: ['terror', 'terrorist', 'hamas', 'militant'] },
  { label: '평화 협상', terms: ['peace', 'peace talks', 'peace plan', 'settlement'] },
  { label: '규제 약화 우려', terms: ['weaken', 'rollback', 'deregulation', 'moratorium', 'safeguard'] },
  { label: '경제적 영향', terms: ['economy', 'economic', 'trade', 'market', 'finance', 'cost'] },
  { label: '환경 보호', terms: ['protect', 'preserve', 'rainforest', 'climate', 'environment', 'deforestation'] },
  { label: '개발 필요성', terms: ['develop', 'development', 'growth', 'infrastructure', 'soy', 'industry'] },
];

const FALLBACK_LABELS = {
  ceasefire: '휴전',
  humanitarian: '인도적 위기',
  security: '안보',
  hostages: '인질',
  hostage: '인질',
  dialogue: '대화',
  negotiations: '협상',
  talks: '협상',
  peace: '평화',
  gaza: '가자',
  israel: '이스라엘',
  palestine: '팔레스타인',
  deforestation: '산림파괴',
  rainforest: '우림',
  climate: '기후',
  immigration: '이민',
  refugees: '난민',
  euthanasia: '안락사',
};

function getText(data) {
  return [
    ...(data.allArticles || []).flatMap((article) => [
      article.title,
      article.description,
      article.content,
      article.snippet,
    ]),
    ...(data.keyPhrases || []).map((phrase) => phrase.text),
    ...(data.keywords || []),
  ].filter(Boolean).join(' ').toLowerCase();
}

function scoreRules(text, rules) {
  return rules
    .map((rule) => ({
      label: rule.label,
      score: rule.terms.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.label);
}

function fallbackItems(data, limit) {
  const phrases = (data.keyPhrases || []).map((phrase) => phrase.text);
  const keywords = (data.keywords || []).map((keyword) => FALLBACK_LABELS[keyword.toLowerCase()] || keyword);
  return [...phrases, ...keywords]
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, limit);
}

function fillItems(items, data, limit) {
  const merged = [...items, ...fallbackItems(data, limit)]
    .filter((item, index, arr) => arr.indexOf(item) === index);
  return merged.slice(0, limit);
}

function buildComparison(country1Name, country2Name, country1Data, country2Data) {
  const text1 = getText(country1Data);
  const text2 = getText(country2Data);
  const emphasis1 = scoreRules(text1, PERSPECTIVE_RULES);
  const emphasis2 = scoreRules(text2, PERSPECTIVE_RULES);

  const countryAEmphasis = fillItems(
    emphasis1.filter((item) => !emphasis2.slice(0, 4).includes(item)),
    country1Data,
    4
  );
  const countryBEmphasis = fillItems(
    emphasis2.filter((item) => !emphasis1.slice(0, 4).includes(item)),
    country2Data,
    4
  );

  const leftSummary = countryAEmphasis.slice(0, 2).join('와 ');
  const rightSummary = countryBEmphasis.slice(0, 2).join('와 ');
  const summary = `${country1Name} 보도는 ${leftSummary || '주요 이슈'}를 더 강조하고, ${country2Name} 보도는 ${rightSummary || '다른 쟁점'}를 더 강조합니다.`;

  return { countryAEmphasis, countryBEmphasis, summary };
}

function Chip({ children, color = 'neutral' }) {
  const classes = {
    left: 'border-accent/30 bg-accent/10 text-accent',
    right: 'border-navy/30 bg-navy/10 text-navy',
    neutral: 'border-border bg-parchment text-ink',
  };

  return (
    <span className={`text-xs font-body font-semibold px-2 py-1 rounded-full border ${classes[color]}`}>
      {children}
    </span>
  );
}

function PerspectiveColumn({ title, items, color }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-body font-bold text-ink mb-2 leading-snug">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Chip key={item} color={color}>{item}</Chip>
        ))}
      </div>
    </div>
  );
}

function PerspectiveCompareCard({ country1Name, country2Name, country1Data, country2Data }) {
  const comparison = buildComparison(country1Name, country2Name, country1Data, country2Data);

  return (
    <div className="card p-4">
      <p className="section-label mb-4">보도 관점 비교</p>

      <div className="grid grid-cols-1 gap-4">
        <PerspectiveColumn
          title={`${country1Name}가 더 강조하는 관점`}
          items={comparison.countryAEmphasis}
          color="left"
        />

        <PerspectiveColumn
          title={`${country2Name}가 더 강조하는 관점`}
          items={comparison.countryBEmphasis}
          color="right"
        />
      </div>

      <div className="mt-4 bg-parchment border border-border rounded-sm px-3 py-2">
        <p className="text-xs font-body text-muted leading-relaxed">{comparison.summary}</p>
      </div>
    </div>
  );
}

export default PerspectiveCompareCard;
