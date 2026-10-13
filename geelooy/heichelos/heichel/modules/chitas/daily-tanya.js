// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DailyTanya
 * @description
 * Maps a Hebrew date to the day's Tanya study using the chitas_regular /
 * chitas_leap mappings carried on all 90 Tanya posts. Leap-year cycle is
 * selected automatically from the Hebrew date. The traditional cycle has
 * gaps (Tishrei and early Cheshvan have no assigned portion).
 */

import { TANYA_CHITAS } from './tanya-chitas-data.js';
import { hebrewDateFromGregorian } from './hebrew-date.js';

/**
 * @param {Date} date Local civil date.
 * @returns {{postIds: string[], hebrewDate: string, cycle: string, hasPortion: boolean}}
 */
export function tanyaForDate(date) {
  const h = hebrewDateFromGregorian(date);
  const cycle = h.leap ? 'leap' : 'regular';
  const key = `${h.tanyaMonth} ${h.day}`;
  const postIds = TANYA_CHITAS[cycle]?.[key] || [];
  return {
    postIds,
    hebrewDate: `${h.day} ${h.monthHe} ${h.year}`,
    hebrewDateEn: `${h.day} ${h.monthEn} ${h.year}`,
    cycle: h.leap ? 'leap year' : 'regular year',
    leap: h.leap,
    hasPortion: postIds.length > 0,
  };
}
