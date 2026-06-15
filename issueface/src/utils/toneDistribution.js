export function getToneDistribution(articles = []) {
  const total = articles.length;
  const pos = articles.filter((article) => article.toneScore >= 0.3).length;
  const neg = articles.filter((article) => article.toneScore <= -0.3).length;
  const neu = total - pos - neg;

  return {
    pos,
    neu,
    neg,
    total,
    posPct: total ? (pos / total) * 100 : 0,
    neuPct: total ? (neu / total) * 100 : 0,
    negPct: total ? (neg / total) * 100 : 0,
  };
}
