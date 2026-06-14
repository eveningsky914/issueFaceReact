export function getMoodFromTone(tone) {
  const value = Number(tone);

  if (!Number.isFinite(value)) return 'neutral';
  if (value <= -0.3) return 'negative';
  if (value >= 0.3) return 'positive';
  return 'neutral';
}
