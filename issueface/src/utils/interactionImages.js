import cnJpPositivePositive from '../assets/interactions/cn-jp/positive_positive.png';
import cnJpPositiveNegative from '../assets/interactions/cn-jp/positive_negative.png';
import cnJpNegativeNegative from '../assets/interactions/cn-jp/negative_negative.png';

export const interactionImageMap = {
  'CN-JP': {
    positive_positive: cnJpPositivePositive,
    positive_negative: cnJpPositiveNegative,
    negative_negative: cnJpNegativeNegative,
  },
};

export function getInteractionImage(normalizedPairKey, interactionType) {
  const pairKey = String(normalizedPairKey || '').toUpperCase();
  const type = String(interactionType || '');

  return interactionImageMap[pairKey]?.[type] || null;
}
