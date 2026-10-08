//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Pure Hebrew + Gregorian calendar math — zero imports, zero I/O.
 * @description Implements the Hebrew calendar from first principles (molad +
 * the four dechiyot), plus Rata Die conversions for the Gregorian calendar.
 * Every function is pure so script.mjs can embed them verbatim in the browser
 * via Function.prototype.toString() — server and client can never drift.
 *
 * Month numbering (Calendrical Calculations convention):
 *   1=Nisan 2=Iyar 3=Sivan 4=Tammuz 5=Av 6=Elul
 *   7=Tishrei 8=Cheshvan 9=Kislev 10=Tevet 11=Shevat 12=Adar(/Adar II) 13=Adar I (leap only)
 *
 * Rata Die: day 1 = Monday, January 1, 1 CE (proleptic Gregorian).
 */

export const HEBREW_EPOCH = -1373427; // RD of 1 Tishrei, 1 AM (a Monday)

const PARTS_PER_HOUR = 1080;
const PARTS_PER_DAY = 25920;          // 24 * 1080
const LUNATION_PARTS = 765433;        // 29d 12h 793p
const EPOCH_MOLAD_PARTS = 5604;       // BeHaRaD: Monday, 5h 204p after Sunday 6pm

/** True when Hebrew year y is a leap year (13 months). */
export function isHebrewLeapYear(y) {
	return ((7 * y + 1) % 19) < 7;
}

/** Number of months elapsed before Hebrew year y (i.e. in years 1..y-1). */
function monthsBeforeYear(y) {
	return Math.floor((235 * y - 234) / 19);
}

/** Weekday of a Jewish day index d (days after epoch, epoch day 0 = Monday). 0=Sun..6=Sat. */
function jewishWeekday(d) {
	return (((d + 1) % 7) + 7) % 7;
}

/**
 * Days after the Hebrew epoch to 1 Tishrei of year y (the Rosh Hashanah date),
 * applying the four dechiyot: molad zaken, lo ADU Rosh, gatarad, betutkafot.
 * @param {number} y Hebrew year (e.g. 5786)
 * @returns {number} Days after epoch (add HEBREW_EPOCH for the Rata Die).
 */
export function hebrewNewYearDays(y) {
	const months = monthsBeforeYear(y);
	const molad = EPOCH_MOLAD_PARTS + months * LUNATION_PARTS; // parts after epoch
	const moladDay = Math.floor(molad / PARTS_PER_DAY);
	const moladTime = molad % PARTS_PER_DAY; // parts after 6pm
	const moladWd = jewishWeekday(moladDay); // 0=Sun..6=Sat

	let d = moladDay;
	// 1. Molad zaken: molad at/after noon (18:00 from 6pm) -> postpone one day.
	if (moladTime >= 18 * PARTS_PER_HOUR) d += 1;
	// 2. Lo ADU Rosh: Rosh Hashanah may not fall on Sun / Wed / Fri.
	const wd2 = jewishWeekday(d);
	if (wd2 === 0 || wd2 === 3 || wd2 === 5) d += 1;
	// 3. Gatarad: common year, MOLAD on Tuesday at/after 9h 204p -> Thursday.
	//    (Uses the molad weekday, not the postponed day; never pushes past Thursday.)
	if (!isHebrewLeapYear(y) && moladWd === 2 && moladTime >= 9 * PARTS_PER_HOUR + 204) {
		d = Math.max(d, moladDay + 2);
	}
	// 4. Betutkafot: year AFTER a leap year, MOLAD on Monday at/after 15h 589p -> +1.
	//    (Keeps the preceding leap year at a valid 383+ days.)
	if (isHebrewLeapYear(y - 1) && moladWd === 1 && moladTime >= 15 * PARTS_PER_HOUR + 589) {
		d = Math.max(d, moladDay + 1);
	}
	return d;
}

/** Rata Die of 1 Tishrei of Hebrew year y. */
export function hebrewNewYearRD(y) {
	return HEBREW_EPOCH + hebrewNewYearDays(y);
}

/** Length of Hebrew year y in days (353/354/355 or 383/384/385). */
export function hebrewYearLength(y) {
	return hebrewNewYearRD(y + 1) - hebrewNewYearRD(y);
}

/**
 * Length of a Hebrew month in days.
 * @param {number} y Hebrew year
 * @param {number} m Month 1..13 (13 = Adar I, leap years only)
 */
export function hebrewMonthLength(y, m) {
	switch (m) {
		case 1: return 30;  // Nisan
		case 2: return 29;  // Iyar
		case 3: return 30;  // Sivan
		case 4: return 29;  // Tammuz
		case 5: return 30;  // Av
		case 6: return 29;  // Elul
		case 7: return 30;  // Tishrei
		case 8: {           // Cheshvan: 29 or 30
			const L = hebrewYearLength(y);
			return (L === 355 || L === 385) ? 30 : 29;
		}
		case 9: {           // Kislev: 29 or 30
			const L = hebrewYearLength(y);
			return (L === 353 || L === 383) ? 29 : 30;
		}
		case 10: return 29; // Tevet
		case 11: return 30; // Shevat
		case 12: return 29; // Adar (or Adar II in leap years)
		case 13: return 30; // Adar I (leap years only)
		default: throw new RangeError("hebrewMonthLength: month out of range 1..13: " + m);
	}
}

/**
 * Rata Die of a Hebrew date.
 * @param {number} y Hebrew year
 * @param {number} m Month 1..13
 * @param {number} d Day of month 1..30
 */
export function hebrewToRD(y, m, d) {
	if (m < 1 || m > 13) throw new RangeError("hebrewToRD: bad month " + m);
	if (m === 13 && !isHebrewLeapYear(y)) throw new RangeError("hebrewToRD: Adar I in non-leap year");
	let rd = hebrewNewYearRD(y) + (d - 1);
	const lastMonth = isHebrewLeapYear(y) ? 13 : 12;
	if (m >= 7) {
		for (let mm = 7; mm < m; mm++) rd += hebrewMonthLength(y, mm);
	} else {
		for (let mm = 7; mm <= lastMonth; mm++) rd += hebrewMonthLength(y, mm);
		for (let mm = 1; mm < m; mm++) rd += hebrewMonthLength(y, mm);
	}
	return rd;
}

/**
 * Hebrew date of a Rata Die.
 * @param {number} rd Rata Die
 * @returns {{year:number, month:number, day:number}}
 */
export function rdToHebrew(rd) {
	let y = Math.floor((rd - HEBREW_EPOCH) / 365.25) + 1;
	while (hebrewNewYearRD(y + 1) <= rd) y++;
	while (hebrewNewYearRD(y) > rd) y--;
	const lastMonth = isHebrewLeapYear(y) ? 13 : 12;
	let m = 7;
	let dayStart = hebrewNewYearRD(y);
	while (true) {
		const len = hebrewMonthLength(y, m);
		if (rd < dayStart + len) break;
		dayStart += len;
		m++;
		if (m > lastMonth) m = 1;
		if (m === 7) break; // safety; should never happen
	}
	return { year: y, month: m, day: rd - dayStart + 1 };
}

/** True when Gregorian year y is a leap year. */
export function isGregorianLeapYear(y) {
	return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/**
 * Rata Die of a Gregorian date (proleptic Gregorian).
 * @param {number} y Full year
 * @param {number} m Month 1..12
 * @param {number} d Day 1..31
 */
export function gregorianToRD(y, m, d) {
	const y1 = y - 1;
	return 365 * y1 + Math.floor(y1 / 4) - Math.floor(y1 / 100) + Math.floor(y1 / 400)
		+ Math.floor((367 * m - 362) / 12)
		+ (m <= 2 ? 0 : (isGregorianLeapYear(y) ? -1 : -2))
		+ d;
}

/**
 * Gregorian date of a Rata Die.
 * @param {number} rd Rata Die
 * @returns {{y:number, m:number, d:number}}
 */
export function rdToGregorian(rd) {
	let y = Math.floor((rd - 1) / 365.2425) + 1;
	while (gregorianToRD(y + 1, 1, 1) <= rd) y++;
	while (gregorianToRD(y, 1, 1) > rd) y++;
	let m = 1;
	while (m < 12 && gregorianToRD(y, m + 1, 1) <= rd) m++;
	return { y, m, d: rd - gregorianToRD(y, m, 1) + 1 };
}

/** Weekday of a Rata Die. 0=Sunday .. 6=Saturday. (RD 1 = Monday.) */
export function rdWeekday(rd) {
	const x = (((rd - 1) % 7) + 7) % 7; // 0=Mon .. 6=Sun
	return (x + 1) % 7;                 // 0=Sun .. 6=Sat
}
