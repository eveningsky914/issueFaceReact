const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'positive_positive.png',
  'positive_negative.png',
  'negative_negative.png',
];

const interactionsDir = path.resolve(__dirname, '..', 'src', 'assets', 'interactions');
const outputPath = path.resolve(__dirname, '..', 'src', 'utils', 'interactionImages.js');

function toPascalCase(value) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

function makeVariableName(pairKey, fileName) {
  const baseName = fileName.replace(/\.png$/i, '');
  const pascal = `${toPascalCase(pairKey)}${toPascalCase(baseName)}`;
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function makeMapKey(pairKey) {
  return pairKey.toUpperCase();
}

function getPairDirs() {
  if (!fs.existsSync(interactionsDir)) return [];

  return fs
    .readdirSync(interactionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const imports = [];
const mapEntries = [];

getPairDirs().forEach((pairKey) => {
  const pairDir = path.join(interactionsDir, pairKey);
  const existingFiles = REQUIRED_FILES.filter((fileName) =>
    fs.existsSync(path.join(pairDir, fileName))
  );

  if (existingFiles.length === 0) return;

  const imageEntries = existingFiles.map((fileName) => {
    const interactionType = fileName.replace(/\.png$/i, '');
    const variableName = makeVariableName(pairKey, fileName);
    const importPath = `../assets/interactions/${pairKey}/${fileName}`;

    imports.push(`import ${variableName} from '${importPath}';`);
    return { interactionType, variableName };
  });

  const imageMapLines = imageEntries
    .map(({ interactionType, variableName }) => `    ${interactionType}: ${variableName},`)
    .join('\n');

  mapEntries.push(`  '${makeMapKey(pairKey)}': {\n${imageMapLines}\n  },`);
});

const output = `${imports.join('\n')}

export const interactionImageMap = {
${mapEntries.join('\n')}
};

export function getInteractionImage(normalizedPairKey, interactionType) {
  const pairKey = String(normalizedPairKey || '').toUpperCase();
  const type = String(interactionType || '');

  return interactionImageMap[pairKey]?.[type] || null;
}
`;

fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
console.log(`Registered ${mapEntries.length} interaction pair(s).`);
