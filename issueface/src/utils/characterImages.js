import krPositive from '../assets/characters/kr_positive.jpg';
import krNeutral from '../assets/characters/kr_neutral.jpg';
import krNegative from '../assets/characters/kr_negative.jpg';

import { getMoodFromTone } from './toneMood';

export const fallbackCharacterImage = krNeutral;

export const characterImageMap = {
  KR: {
    positive: krPositive,
    neutral: krNeutral,
    negative: krNegative,
  },
};

export function getCharacterImage(countryCode, tone) {
  const code = String(countryCode || '').toUpperCase();
  const mood = getMoodFromTone(tone);

  return characterImageMap[code]?.[mood] || fallbackCharacterImage;
}
