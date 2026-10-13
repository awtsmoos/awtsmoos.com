// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HebrewDate
 * @description
 * Real Hebrew calendar computation using the standard molad-based algorithm
 * from Calendrical Calculations (Reingold & Dershowitz). Computes Hebrew date
 * from Gregorian, leap year status, month lengths. No hardcoded dates.
 */

// Rata Die day number of Hebrew epoch (1 Tishrei, 1 AM)
const HEBREW_EPOCH = -1373427;

function mod(a, b) { return a - b * Math.floor(a / b); }

function isLeapYear(year) {
  return mod(7 * year + 1, 19) < 7;
}

function lastMonthOfYear(year) {
  return isLeapYear(year) ? 13 : 12;
}

// Number of days from epoch to 1 Tishrei of `year`
function elapsedDays(year) {
  // Months elapsed from epoch
  const monthsElapsed = Math.floor((235 * year - 234) / 19);
  // Parts (1/1080 hour) elapsed
  const partsElapsed = 204 + 793 * mod(monthsElapsed, 1080);
  const hoursElapsed = 5 + 12 * monthsElapsed
    + Math.floor(monthsElapsed / 1080) * 793
    + Math.floor(partsElapsed / 1080);
  const day = 1 + 29 * monthsElapsed + Math.floor(hoursElapsed / 24);
  const parts = mod(1080 * mod(hoursElapsed, 24) + mod(partsElapsed, 1080), 25920);
  
  // Dechiyot
  let d = day;
  const altDay = d + 1;
  // If molad is at or after noon, postpone
  if (parts >= 19440) d = altDay;
  // If not leap and molad on Tuesday at/after 9h204p, postpone (to avoid leap year issues)
  else if (mod(d, 7) === 2 && parts >= 9924 && !isLeapYear(year)) d = altDay;
  // If leap previous year and molad on Monday at/after 15h589p, postpone
  else if (mod(d, 7) === 1 && parts >= 16789 && isLeapYear(year - 1)) d = altDay;
  
  // Lo ADU Rosh: Rosh Hashana cannot be Sunday, Wednesday, Friday
  const dow = mod(d, 7);
  if (dow === 0 || dow === 3 || dow === 5) d++;
  
  return d - 1; // Convert to days since epoch (0-indexed)
}

function daysInYear(year) {
  return elapsedDays(year + 1) - elapsedDays(year);
}

function gregorianToFixed(y, m, d) {
  const a = Math.floor((y - 1) / 4);
  const b = Math.floor((y - 1) / 100);
  const c = Math.floor((y - 1) / 400);
  const d0 = Math.floor((367 * m - 362) / 12);
  const isL = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  const e = m <= 2 ? 0 : (isL ? -1 : -2);
  return 365 * (y - 1) + a - b + c + d0 + e + d;
}

function fixedToHebrew(fixed) {
  // Find year via approximation
  let year = Math.floor((fixed - HEBREW_EPOCH) / 366) + 1;
  while (HEBREW_EPOCH + elapsedDays(year + 1) <= fixed) year++;
  while (HEBREW_EPOCH + elapsedDays(year) > fixed) year--;
  
  const startOfYear = HEBREW_EPOCH + elapsedDays(year);
  let dayOfYear = fixed - startOfYear + 1;
  
  const leap = isLeapYear(year);
  const yearLen = daysInYear(year);
  // Determine Cheshvan/Kislev lengths from year length
  // 353/383: deficient (Cheshvan 29, Kislev 29)
  // 354/384: regular (Cheshvan 29, Kislev 30)
  // 355/385: complete (Cheshvan 30, Kislev 30)
  const remainder = yearLen % 10;
  const cheshvanDays = remainder === 5 ? 30 : 29;
  const kislevDays = remainder === 3 ? 29 : 30;
  
  const months = [
    { n: 7, days: 30 },           // Tishrei
    { n: 8, days: cheshvanDays },  // Cheshvan
    { n: 9, days: kislevDays },    // Kislev
    { n: 10, days: 29 },          // Tevet
    { n: 11, days: 30 },          // Shevat
    { n: 12, days: leap ? 30 : 29 }, // Adar
  ];
  if (leap) months.push({ n: 13, days: 29 }); // Adar II
  months.push(
    { n: 1, days: 30 },  // Nisan
    { n: 2, days: 29 },  // Iyar
    { n: 3, days: 30 },  // Sivan
    { n: 4, days: 29 },  // Tammuz
    { n: 5, days: 30 },  // Av
    { n: 6, days: 29 },  // Elul
  );
  
  let mi = 0;
  while (mi < months.length && dayOfYear > months[mi].days) {
    dayOfYear -= months[mi].days;
    mi++;
  }
  
  return { year, month: months[mi].n, day: dayOfYear, leap };
}

const MONTH_NAMES = {
  1: { en: 'Nissan', he: 'ניסן' },
  2: { en: 'Iyar', he: 'אייר' },
  3: { en: 'Sivan', he: 'סיון' },
  4: { en: 'Tammuz', he: 'תמוז' },
  5: { en: 'Av', he: 'אב' },
  6: { en: 'Elul', he: 'אלול' },
  7: { en: 'Tishrei', he: 'תשרי' },
  8: { en: 'Cheshvan', he: 'חשון' },
  9: { en: 'Kislev', he: 'כסלו' },
  10: { en: 'Teves', he: 'טבת' },
  11: { en: 'Shevat', he: 'שבט' },
  12: { en: 'Adar', he: 'אדר' },
  13: { en: 'Adar II', he: 'אדר ב׳' },
};

export function hebrewDateFromGregorian(date) {
  const fixed = gregorianToFixed(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const h = fixedToHebrew(fixed);
  const names = MONTH_NAMES[h.month];
  return {
    year: h.year,
    month: h.month,
    day: h.day,
    leap: h.leap,
    monthEn: names.en,
    monthHe: names.he,
    tanyaMonth: h.month === 13 ? 'Adar II' : (h.month === 12 && h.leap ? 'Adar I' : names.en),
  };
}

export function isHebrewLeapYear(gregorianDate) {
  return hebrewDateFromGregorian(gregorianDate).leap;
}

/**
 * Is the given Hebrew year (AM) a leap year? (19-year cycle)
 * @param {number} hebrewYear
 * @returns {boolean}
 */
export function isLeapHebrewYear(hebrewYear) {
  return isLeapYear(hebrewYear);
}

/**
 * Yaakov's rule: the Tanya cycle starts 19 Kislev. The schedule (leap vs
 * regular) for the ENTIRE active cycle is determined by whether the Hebrew
 * year in which the cycle STARTED was a leap year — not by the current
 * calendar year.
 * @param {{year:number, month:number, day:number}} h Hebrew date (month 1-13, Kislev=9)
 * @returns {number} The Hebrew year (AM) in which the active cycle started.
 */
export function tanyaCycleStartYear(h) {
  // The Hebrew year runs Tishrei (7) -> Elul (6). 19 Kislev (month 9, day 19)
  // falls early in the year. If today is in Tishrei/Cheshvan, or Kislev before
  // the 19th, the most recent 19 Kislev was in the PREVIOUS Hebrew year.
  // Otherwise (Kislev 19 onward through Elul), it was this Hebrew year.
  if (h.month === 7 || h.month === 8 || (h.month === 9 && h.day < 19)) {
    return h.year - 1;
  }
  return h.year;
}
