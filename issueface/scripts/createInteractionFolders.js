const fs = require('fs');
const path = require('path');

const COUNTRY_CODES = ['KR', 'JP', 'US', 'CN', 'BR', 'ID', 'AU', 'GB', 'EG'];
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

fs.mkdirSync(interactionsDir, { recursive: true });

const pairKeys = getPairKeys(COUNTRY_CODES);

pairKeys.forEach((pairKey) => {
  const pairDir = path.join(interactionsDir, pairKey);
  const keepFile = path.join(pairDir, '.gitkeep');

  fs.mkdirSync(pairDir, { recursive: true });

  if (!fs.existsSync(keepFile)) {
    fs.writeFileSync(keepFile, '');
  }
});

console.log(`Created or verified ${pairKeys.length} interaction folders.`);
console.log(`Location: ${path.relative(process.cwd(), interactionsDir)}`);
