// B"H
/**
 * @file levelIdNormalizer.js
 * @description Chapter 366: A level id is purified before the gate opens.
 */
export function normalizeLevelId(id) {
  const stem = String(id || '').trim().replace(/\.(?:js|json)$/i, '');
  return stem ? `${stem}.json` : '';
}
