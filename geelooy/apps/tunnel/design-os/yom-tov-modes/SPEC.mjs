//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SPEC for Awtsmoos Design OS — Yom Tov Modes.
 * @description Shared interface shapes. Yom Tov Modes extends Shabbos Mode:
 * each Yom Tov gets its own visual soul — palette, mood, voice — while
 * freeze days (Pesach, Sukkot, Shavuot, Yamim Noraim) reuse the Shabbos
 * stillness. Theme-only days (Chanukah, Purim, Chol HaMoed, fasts) get a
 * beautiful standalone surface without the freeze.
 *
 * Data shapes:
 *
 * YomTovOptions = {
 *   lat: number, lon: number, utcOffsetMin: number,
 *   diaspora?: boolean,       // second days of Yom Tov (default true)
 *   autoEnable?: boolean,     // client: enter mode automatically (default true)
 *   offerBeforeMin?: number,  // client: offer mode this many minutes before (default 120)
 *   remember?: boolean,       // client: persist manual toggle (default true)
 *   inlineScript?: boolean,   // html: inline the client script (default true)
 *   stripScripts?: boolean,   // html: remove other <script> tags (default false)
 *   palette?: object,         // theme palette override
 * }
 *
 * HolidayEntry = {
 *   key: string,              // "pesach-1", "yom-kippur", "erev-pesach-1"...
 *   mode: string,             // pesach|sukkos|shavuos|yamim-noraim|chanukah|purim|solemn|minor
 *   type: string,             // yomtov|chol|fast|minor|erev
 *   hebrew: { y, m, d },      // month: 1=Nisan..7=Tishrei..12=Adar(II), 13=Adar I
 *   rd: number,               // Rata Die
 *   nameHe: string, nameEn: string,
 *   blockStart: boolean,      // first day of a yomtov block
 * }
 *
 * YomTovWindow = {
 *   current: HolidayEntry|null,  // sunset-aware "today"
 *   next: HolidayEntry|null, nextInDays: number,
 *   jewishRD: number, inYomTov: boolean,
 * }
 */

export const DEFAULTS = Object.freeze({
	diaspora: true,
	autoEnable: true,
	offerBeforeMin: 120,
	remember: true,
	inlineScript: true,
	stripScripts: false,
});

export const STORAGE_KEY = "awt-yomtov-mode";
export const YOMTOV_HTML_CLASS = "yomtov-mode";
