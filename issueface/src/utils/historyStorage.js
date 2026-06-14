export const HISTORY_STORAGE_KEY = 'issueface_history';
const MAX_HISTORY_COUNT = 20;

export const makeCountryPairKey = (a, b) => [a, b].sort().join('-');

function normalizeHistoryItem(item) {
  const countryPairKey = item.countryPairKey || makeCountryPairKey(item.country1, item.country2);
  return {
    ...item,
    countryPairKey,
    id: `${countryPairKey}-${item.topic}`,
  };
}

function readRawHistory() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
}

export function normalizeHistoryList(items) {
  const seen = new Set();
  const normalized = [];

  items
    .map(normalizeHistoryItem)
    .sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))
    .forEach((item) => {
      const dedupeKey = `${item.countryPairKey}-${item.topic}`;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      normalized.push(item);
    });

  return normalized.slice(0, MAX_HISTORY_COUNT);
}

export function getHistory() {
  const normalized = normalizeHistoryList(readRawHistory());
  writeHistory(normalized);
  return normalized;
}

export function addHistory(item) {
  const normalizedItem = normalizeHistoryItem({
    ...item,
    savedAt: item.savedAt || new Date().toISOString(),
  });
  const dedupeKey = `${normalizedItem.countryPairKey}-${normalizedItem.topic}`;
  const previous = getHistory().filter((historyItem) => (
    `${historyItem.countryPairKey}-${historyItem.topic}` !== dedupeKey
  ));
  const next = normalizeHistoryList([normalizedItem, ...previous]);
  writeHistory(next);
  return next;
}

export function removeHistory(id) {
  const next = getHistory().filter((item) => item.id !== id);
  writeHistory(next);
  return next;
}

export function clearHistory() {
  writeHistory([]);
  return [];
}
