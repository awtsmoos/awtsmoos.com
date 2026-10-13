// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DailyChumash
 * @description
 * Maps a civil date + parsha to the day's Chumash aliyah using the standard
 * 7-aliyah divisions. Handles doubled parshas (3 aliyot from the first,
 * 4 from the second) and the Simchat Torah / Bereshit transitions.
 */

import { PARSHA_ALIYOT } from './aliyot-data.js';
import { PARSHA_NAME_MAP, PARSHA_DOUBLES } from './parsha-names-data.js';
import { aliyahNumberForDate } from './date-policy.js';

function normalizeParshaName(title) {
  let name = String(title || '').replace(/^Parashat\s+/i, '').trim();
  name = name.replace(/[\u2019\u2018]/g, "'");
  if (PARSHA_NAME_MAP[name]) return PARSHA_NAME_MAP[name];
  return name;
}

/**
 * Resolves the 7-aliyah sequence for a (possibly doubled) parsha.
 * @param {string} parshaTitle Hebcal parsha title (e.g. "Parashat Matot-Masei").
 * @returns {Array|null} 7 aliyah entries with {n, en, he, start, end, parshaEn, parshaHe}.
 */
export function aliyotForParsha(parshaTitle) {
  const name = normalizeParshaName(parshaTitle);
  
  // Doubled parsha: first 3 aliyot from first parsha, last 4 from second
  if (PARSHA_DOUBLES[name]) {
    const [first, second] = PARSHA_DOUBLES[name];
    const a = PARSHA_ALIYOT[first];
    const b = PARSHA_ALIYOT[second];
    if (!a || !b) return null;
    const combined = [
      ...a.aliyot.slice(0, 3).map(x => ({ ...x, parshaEn: first, parshaHe: a.he })),
      ...b.aliyot.slice(3, 7).map(x => ({ ...x, parshaEn: second, parshaHe: b.he })),
    ];
    // Renumber 1-7
    return combined.map((x, i) => ({ ...x, n: i + 1 }));
  }
  
  const entry = PARSHA_ALIYOT[name];
  if (!entry) return null;
  return entry.aliyot.map(x => ({ ...x, parshaEn: name, parshaHe: entry.he }));
}

/**
 * @param {Date} date Local civil date.
 * @param {string} parshaTitle Hebcal parsha title for the week.
 * @returns {object|null} The day's aliyah with verse range.
 */
export function chumashForDate(date, parshaTitle) {
  const aliyot = aliyotForParsha(parshaTitle);
  if (!aliyot) return null;
  const n = aliyahNumberForDate(date); // 1-7, Sunday=1
  const aliyah = aliyot[n - 1];
  if (!aliyah) return null;
  return {
    ...aliyah,
    parshaTitle,
    weekday: date.getDay(), // 0=Sunday
  };
}
