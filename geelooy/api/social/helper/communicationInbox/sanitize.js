// B"H
/**
 * Chapter 533: Before a message becomes a citizen of the inbox, its name is
 * washed. The living OS accepts many voices, but no jagged shards.
 */
function cleanText(value, max = 1200) {
  return String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
}

function cleanId(value, fallback = '') {
  return cleanText(value, 180).replace(/[^a-zA-Z0-9_:@./-]/g, '_') || fallback;
}

function cleanLimit(value, fallback = 50, max = 200) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(Math.floor(number), max);
}

function normalizeKind(value) {
  return cleanId(value || 'chat', 'chat').toLowerCase();
}

function nowStamp(value) {
  const number = Number(value || Date.now());
  return Number.isFinite(number) ? number : Date.now();
}

module.exports = { cleanText, cleanId, cleanLimit, normalizeKind, nowStamp };
