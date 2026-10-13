// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DailyTanya
 * @description
 * Maps a Hebrew date to the day's Tanya study using the full Chitas cycle
 * (19 Kislev -> 18 Kislev). Yaakov's rule: the leap/regular schedule for the
 * ENTIRE active cycle is determined by whether the Hebrew year in which the
 * cycle STARTED (most recent 19 Kislev at or before today) was a leap year —
 * NOT by the current calendar year. Every day of the year has a portion.
 */

import { TANYA_CHITAS } from './tanya-chitas-data.js';
import {
  hebrewDateFromGregorian,
  tanyaCycleStartYear,
  isLeapHebrewYear,
} from './hebrew-date.js';

/**
 * @param {Date} date Local civil date.
 * @returns {{postIds: string[], portion: object|null, hebrewDate: string, cycle: string, hasPortion: boolean}}
 */
export function tanyaForDate(date) {
  const h = hebrewDateFromGregorian(date);
  // Yaakov's correction: schedule follows the cycle-start year, not the
  // current calendar year.
  const cycleYear = tanyaCycleStartYear(h);
  const cycleLeap = isLeapHebrewYear(cycleYear);
  const cycle = cycleLeap ? 'leap' : 'regular';
  const key = `${h.tanyaMonth} ${h.day}`;
  const entry = TANYA_CHITAS[cycle]?.[key] || null;
  const postIds = entry?.postIds || [];
  return {
    postIds,
    portion: entry?.portion || null,
    hebrewDate: `${h.day} ${h.monthHe} ${h.year}`,
    hebrewDateEn: `${h.day} ${h.monthEn} ${h.year}`,
    cycle: cycleLeap ? 'leap year' : 'regular year',
    cycleYear,
    leap: cycleLeap,
    hasPortion: !!entry,
  };
}
