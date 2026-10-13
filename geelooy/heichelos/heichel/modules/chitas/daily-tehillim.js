// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DailyTehillim
 * @description
 * Monthly Tehillim cycle: day of the Hebrew month -> chapter range.
 * Standard 29-day division; day 30 (full months) repeats day 1's portion.
 */

import { TEHILLIM_MONTHLY } from './tehillim-data.js';
import { hebrewDateFromGregorian } from './hebrew-date.js';

/**
 * @param {Date} date Local civil date.
 * @returns {{start: number, end: number, hebrewDay: number}}
 */
export function tehillimForDate(date) {
  const h = hebrewDateFromGregorian(date);
  const day = Math.min(h.day, 30);
  const range = TEHILLIM_MONTHLY[String(day)] || TEHILLIM_MONTHLY['1'];
  return {
    start: range[0],
    end: range[1],
    hebrewDay: h.day,
    label: range[0] === range[1] ? `Chapter ${range[0]}` : `Chapters ${range[0]}–${range[1]}`,
    labelHe: range[0] === range[1] ? `פרק ${range[0]}` : `פרקים ${range[0]}–${range[1]}`,
  };
}
