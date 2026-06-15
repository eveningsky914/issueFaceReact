const fs = require('fs');
const path = require('path');

const COUNTRY_CODES = ['KR', 'JP', 'US', 'CN', 'BR', 'ID', 'AU', 'GB', 'EG'];
const REQUIRED_FILES = [
  'positive_positive.png',
  'positive_negative.png',
  'negative_negative.png',
];
const interactionsDir = path.resolve(__dirname, '..', 'src', 'assets', 'interactions');

function makePairKey(a, b) {
  return [a, b].sort().join('-').toLowerCase();
}

function getPairKeys(codes) {
  const pairs = [];

  for (let i = 0; i < codes.length; i += 1) {
    for (let j = i + 1; j < codes.length; j += 1) {
      pairs.push(makePairKey(codes[i], codes[j]));
    }
  }

  return pairs.sort();
}

const missing = [];

getPairKeys(COUNTRY_CODES).forEach((pairKey) => {
  const pairDir = path.join(interactionsDir, pairKey);

  REQUIRED_FILES.forEach((fileName) => {
    const filePath = path.join(pairDir, fileName);

    if (!fs.existsSync(filePath)) {
      missing.push(path.relative(process.cwd(), filePath));
    }
  });
});

if (missing.length === 0) {
  console.log('All interaction images are present.');
} else {
  console.log(`Missing ${missing.length} interaction image file(s):`);
  missing.forEach((filePath) => {
    console.log(`- ${filePath}`);
  });
}
