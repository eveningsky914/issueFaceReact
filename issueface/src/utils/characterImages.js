import krPositive from '../assets/characters/kr/kr_positive.png';
import krNeutral from '../assets/characters/kr/kr_neutral.png';
import krNegative from '../assets/characters/kr/kr_negative.png';
import usPositive from '../assets/characters/us/us_positive.png';
import usNeutral from '../assets/characters/us/us_neutral.png';
import usNegative from '../assets/characters/us/us_negative.png';
import gbPositive from '../assets/characters/gb/gb_positive.png';
import gbNeutral from '../assets/characters/gb/gb_neutral.png';
import gbNegative from '../assets/characters/gb/gb_negative.png';
import auPositive from '../assets/characters/au/au_positive.png';
import auNeutral from '../assets/characters/au/au_neutral.png';
import auNegative from '../assets/characters/au/au_negative.png';
import jpPositive from '../assets/characters/jp/jp_positive.png';
import jpNeutral from '../assets/characters/jp/jp_neutral.png';
import jpNegative from '../assets/characters/jp/jp_negative.png';
import egPositive from '../assets/characters/eg/eg_positive.png';
import egNeutral from '../assets/characters/eg/eg_neutral.png';
import egNegative from '../assets/characters/eg/eg_negative.png';
import cnPositive from '../assets/characters/cn/cn_positive.png';
import cnNeutral from '../assets/characters/cn/cn_neutral.png';
import cnNegative from '../assets/characters/cn/cn_negative.png';
import idPositive from '../assets/characters/id/id_positive.png';
import idNeutral from '../assets/characters/id/id_neutral.png';
import idNegative from '../assets/characters/id/id_negative.png';
import brPositive from '../assets/characters/br/br_positive.png';
import brNeutral from '../assets/characters/br/br_neutral.png';
import brNegative from '../assets/characters/br/br_negative.png';

import { getMoodFromTone } from './toneMood';

export const fallbackCharacterImage = krNeutral;

export const characterImageMap = {
  KR: {
    positive: krPositive,
    neutral: krNeutral,
    negative: krNegative,
  },
  US: {
    positive: usPositive,
    neutral: usNeutral,
    negative: usNegative,
  },
  GB: {
    positive: gbPositive,
    neutral: gbNeutral,
    negative: gbNegative,
  },
  AU: {
    positive: auPositive,
    neutral: auNeutral,
    negative: auNegative,
  },
  JP: {
    positive: jpPositive,
    neutral: jpNeutral,
    negative: jpNegative,
  },
  EG: {
    positive: egPositive,
    neutral: egNeutral,
    negative: egNegative,
  },
  CN: {
    positive: cnPositive,
    neutral: cnNeutral,
    negative: cnNegative,
  },
  ID: {
    positive: idPositive,
    neutral: idNeutral,
    negative: idNegative,
  },
  BR: {
    positive: brPositive,
    neutral: brNeutral,
    negative: brNegative,
  },
};

export function getCharacterImage(countryCode, tone) {
  const code = String(countryCode || '').toUpperCase();
  const mood = getMoodFromTone(tone);

  return characterImageMap[code]?.[mood] || fallbackCharacterImage;
}
