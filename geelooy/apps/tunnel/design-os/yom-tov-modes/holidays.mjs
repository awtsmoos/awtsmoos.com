//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Yom Tov date computation — pure functions, zero imports.
 * @description Enumerates every Yom Tov / fast / minor day for a Hebrew year,
 * and answers "what (if anything) is today?" All functions are pure so
 * script.mjs can embed them verbatim in the browser via toString().
 *
 * Day types:
 *   "yomtov" — full Yom Tov (melacha-prohibited; the stillness freeze applies)
 *   "chol"   — Chol HaMoed (festive theme, no freeze)
 *   "fast"   — public fast day (subdued theme, no freeze)
 *   "minor"  — minor festive day: Chanukah, Purim, Tu B'Shevat... (theme, no freeze)
 *   "erev"   — the day before a yomtov block begins (offer banner only)
 *
 * Each entry: { key, mode, type, hebrew:{y,m,d}, rd, nameHe, nameEn, blockStart }
 * Modes: pesach | sukkos | shavuos | yamim-noraim | chanukah | purim | solemn | minor
 */

import {
	isHebrewLeapYear, hebrewToRD, hebrewMonthLength, rdToHebrew, rdWeekday,
	gregorianToRD,
} from "./calendar.mjs";

/** True when the Rata Die falls on Shabbos. */
function isShabbos(rd) {
	return rdWeekday(rd) === 6;
}

/**
 * All Yom Tov / fast / minor days in a Hebrew year, in chronological order.
 * @param {number} y Hebrew year (e.g. 5786)
 * @param {object} [opts]
 * @param {boolean} [opts.diaspora=true] Second days of Yom Tov outside Israel.
 * @returns {Array} Holiday entries.
 */
export function holidaysInHebrewYear(y, opts) {
	const diaspora = !opts || opts.diaspora !== false;
	const list = [];
	const add = (m, d, key, mode, type, nameHe, nameEn, blockStart) => {
		list.push({
			key, mode, type,
			hebrew: { y, m, d },
			rd: hebrewToRD(y, m, d),
			nameHe, nameEn,
			blockStart: !!blockStart,
		});
	};

	// --- Tishrei: the Yamim Noraim season ---
	add(7, 1, "rosh-hashanah-1", "yamim-noraim", "yomtov", "ראש השנה", "Rosh Hashanah", true);
	add(7, 2, "rosh-hashanah-2", "yamim-noraim", "yomtov", "ראש השנה ב׳", "Rosh Hashanah II", false);
	let tzomGedaliah = 3;
	if (isShabbos(hebrewToRD(y, 7, 3))) tzomGedaliah = 4; // nidche: fast pushed to Sunday
	add(7, tzomGedaliah, "tzom-gedaliah", "yamim-noraim", "fast", "צום גדליה", "Tzom Gedaliah", false);
	add(7, 10, "yom-kippur", "yamim-noraim", "yomtov", "יום הכפורים", "Yom Kippur", true);

	// --- Sukkot ---
	add(7, 15, "sukkot-1", "sukkos", "yomtov", "סוכות", "Sukkot", true);
	if (diaspora) add(7, 16, "sukkot-2", "sukkos", "yomtov", "סוכות ב׳", "Sukkot II", false);
	const cholStart = diaspora ? 17 : 16;
	for (let d = cholStart; d <= 21; d++) {
		add(7, d, "chol-hamoed-sukkot", "sukkos", "chol", "חול המועד סוכות", "Chol HaMoed Sukkot", false);
	}
	add(7, 22, "shemini-atzeret", "sukkos", "yomtov", "שמיני עצרת", "Shemini Atzeret", true);
	if (diaspora) add(7, 23, "simchat-torah", "sukkos", "yomtov", "שמחת תורה", "Simchat Torah", false);

	// --- Chanukah: 25 Kislev through 2 (or 3) Tevet ---
	const kislevLen = hebrewMonthLength(y, 9);
	for (let i = 0; i < 8; i++) {
		const kd = 25 + i;
		const m = kd <= kislevLen ? 9 : 10;
		const d = kd <= kislevLen ? kd : kd - kislevLen;
		add(m, d, "chanukah", "chanukah", "minor", "חנוכה", "Chanukah", i === 0);
	}

	// --- 10 Tevet ---
	add(10, 10, "asara-btevet", "solemn", "fast", "עשרה בטבת", "Asara B'Tevet", false);

	// --- Tu B'Shevat ---
	add(11, 15, "tu-bshevat", "minor", "minor", "ט״ו בשבט", "Tu B'Shevat", false);

	// --- Purim (Adar = month 12 in both leap and non-leap years) ---
	let taanitEsther = 13;
	if (isShabbos(hebrewToRD(y, 12, 13))) taanitEsther = 11; // mukdam: Thursday
	add(12, taanitEsther, "taanit-esther", "solemn", "fast", "תענית אסתר", "Taanit Esther", false);
	add(12, 14, "purim", "purim", "minor", "פורים", "Purim", true);
	add(12, 15, "shushan-purim", "purim", "minor", "שושן פורים", "Shushan Purim", false);

	// --- Pesach: 15-21 Nisan (22 in diaspora) ---
	add(1, 15, "pesach-1", "pesach", "yomtov", "פסח", "Pesach", true);
	if (diaspora) add(1, 16, "pesach-2", "pesach", "yomtov", "פסח ב׳", "Pesach II", false);
	const pCholStart = diaspora ? 17 : 16;
	const pCholEnd = diaspora ? 20 : 20;
	for (let d = pCholStart; d <= pCholEnd; d++) {
		add(1, d, "chol-hamoed-pesach", "pesach", "chol", "חול המועד פסח", "Chol HaMoed Pesach", false);
	}
	add(1, 21, "pesach-7", "pesach", "yomtov", "שביעי של פסח", "Shevi'i shel Pesach", true);
	if (diaspora) add(1, 22, "pesach-8", "pesach", "yomtov", "אחרון של פסח", "Acharon shel Pesach", false);

	// --- Shavuot: 6 Sivan (7 in diaspora) ---
	add(3, 6, "shavuot-1", "shavuos", "yomtov", "שבועות", "Shavuot", true);
	if (diaspora) add(3, 7, "shavuot-2", "shavuos", "yomtov", "שבועות ב׳", "Shavuot II", false);

	// --- Summer fasts ---
	let shivaAsar = 17;
	if (isShabbos(hebrewToRD(y, 4, 17))) shivaAsar = 18; // nidche
	add(4, shivaAsar, "shiva-asar-btammuz", "solemn", "fast", "שבעה עשר בתמוז", "Shiva Asar B'Tammuz", false);
	let tishaBav = 9;
	if (isShabbos(hebrewToRD(y, 5, 9))) tishaBav = 10; // nidche
	add(5, tishaBav, "tisha-bav", "solemn", "fast", "תשעה באב", "Tisha B'Av", false);
	add(5, 15, "tu-bav", "minor", "minor", "ט״ו באב", "Tu B'Av", false);

	// --- Lag BaOmer ---
	add(2, 18, "lag-baomer", "minor", "minor", "ל״ג בעומר", "Lag BaOmer", false);

	list.sort((a, b) => a.rd - b.rd);
	return list;
}

/**
 * What (if anything) is the Rata Die? Checks the Hebrew year containing rd.
 * @param {number} rd Rata Die
 * @param {object} [opts] { diaspora }
 * @returns {object|null} Holiday entry, or { type:"erev", ... } the day before
 *          a yomtov block, or null.
 */
export function yomTovAtRD(rd, opts) {
	const h = rdToHebrew(rd);
	const days = holidaysInHebrewYear(h.year, opts);
	for (const e of days) {
		if (e.rd === rd) return e;
	}
	// Erev: the day before a yomtov block begins.
	for (const e of days) {
		if (e.blockStart && e.type === "yomtov" && e.rd === rd + 1) {
			return {
				key: "erev-" + e.key,
				mode: e.mode,
				type: "erev",
				hebrew: h,
				rd,
				nameHe: "ערב " + e.nameHe,
				nameEn: "Erev " + e.nameEn,
				blockStart: false,
				forKey: e.key,
			};
		}
	}
	return null;
}

/**
 * What (if anything) is today (or the given Date)?
 * @param {Date} [date=new Date()] The moment to check (local time).
 * @param {object} [opts] { diaspora }
 */
export function yomTovAtDate(date, opts) {
	const d = date instanceof Date ? date : new Date(date);
	const rd = gregorianToRD(d.getFullYear(), d.getMonth() + 1, d.getDate());
	return yomTovAtRD(rd, opts);
}

/**
 * The Yom Tov window around a moment: current day (sunset-aware) and the next
 * upcoming Yom Tov. Mirrors shabbos-mode's getShabbosWindow shape.
 * @param {object} o
 * @param {number} o.lat Latitude degrees
 * @param {number} o.lon Longitude degrees
 * @param {Date} [o.now=new Date()] Reference moment
 * @param {number} o.utcOffsetMin Local UTC offset in minutes
 * @param {function} o.sunsetUTCms Sunset function (from shabbos-mode/times.mjs)
 * @param {object} [o.holidayOpts] { diaspora } passed to holiday lookup
 * @returns {{current:object|null, next:object|null, nextInDays:number,
 *            jewishRD:number, inYomTov:boolean}}
 */
export function getYomTovWindow(o) {
	const { lat, lon, now = new Date(), utcOffsetMin, sunsetUTCms, holidayOpts } = o;
	if (typeof lat !== "number" || typeof lon !== "number" || typeof utcOffsetMin !== "number") {
		throw new TypeError("getYomTovWindow requires numeric lat, lon, utcOffsetMin");
	}
	if (typeof sunsetUTCms !== "function") {
		throw new TypeError("getYomTovWindow requires sunsetUTCms from shabbos-mode/times.mjs");
	}
	const nowMs = now.getTime();
	const localMs = nowMs + utcOffsetMin * 60000;
	const local = new Date(localMs);
	const gy = local.getUTCFullYear(), gm = local.getUTCMonth() + 1, gd = local.getUTCDate();
	const civilRD = gregorianToRD(gy, gm, gd);
	// The Jewish day flips at sunset.
	const sunsetMs = sunsetUTCms(gy, gm, gd, lat, lon);
	const jewishRD = nowMs >= sunsetMs ? civilRD + 1 : civilRD;

	const current = yomTovAtRD(jewishRD, holidayOpts);
	let next = null;
	let nextInDays = -1;
	for (let d = 1; d <= 400; d++) {
		const e = yomTovAtRD(jewishRD + d, holidayOpts);
		if (e && e.type !== "erev") { next = e; nextInDays = d; break; }
	}
	return {
		current,
		next,
		nextInDays,
		jewishRD,
		inYomTov: !!(current && (current.type === "yomtov" || current.type === "chol")),
	};
}
