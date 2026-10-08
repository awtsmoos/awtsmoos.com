//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Yom Tov Modes — public facade.
 * @description One import for everything: Hebrew calendar math, holiday
 * lookup, per-festival themes, stylesheets, HTML transform, client script.
 *
 * Quick start:
 *   import { renderYomTovPage, yomTovAtDate, getYomTovWindow } from "./index.mjs";
 *   import { sunsetUTCms } from "../shabbos-mode/times.mjs";
 *
 *   const entry = yomTovAtDate(new Date());           // what is today?
 *   if (entry) {
 *     const html = renderYomTovPage(pageHtml, entry, { lat, lon, utcOffsetMin });
 *   }
 *   const win = getYomTovWindow({ lat, lon, utcOffsetMin, sunsetUTCms });
 */

export { DEFAULTS, STORAGE_KEY, YOMTOV_HTML_CLASS } from "./SPEC.mjs";
export {
	HEBREW_EPOCH,
	isHebrewLeapYear, hebrewNewYearDays, hebrewNewYearRD, hebrewYearLength,
	hebrewMonthLength, hebrewToRD, rdToHebrew,
	isGregorianLeapYear, gregorianToRD, rdToGregorian, rdWeekday,
} from "./calendar.mjs";
export {
	holidaysInHebrewYear, yomTovAtRD, yomTovAtDate, getYomTovWindow,
} from "./holidays.mjs";
export { MODES, themeFor, modeKeys, modeFreezes, noticeHtml } from "./themes.mjs";
export { yomtovThemeCss, yomtovSurfaceCss, YOMTOV_CLASS } from "./css.mjs";
export {
	addYomTovClass, expandDetails, stripScripts, injectStyle,
	insertYomTovNotice, yomtovStylesheet, applyYomTovHtml,
} from "./html.mjs";
export { yomtovClientScript } from "./script.mjs";

import { applyYomTovHtml } from "./html.mjs";
import { DEFAULTS } from "./SPEC.mjs";

/**
 * Render a full Yom Tov page from source HTML + a holiday entry.
 * @param {string} html Full HTML document.
 * @param {object} entry Holiday entry (from yomTovAtDate / yomTovAtRD).
 * @param {object} [opts] YomTovOptions (see SPEC.mjs).
 * @returns {string} Transformed HTML.
 */
export function renderYomTovPage(html, entry, opts = {}) {
	return applyYomTovHtml(html, entry, Object.assign({}, DEFAULTS, opts));
}
