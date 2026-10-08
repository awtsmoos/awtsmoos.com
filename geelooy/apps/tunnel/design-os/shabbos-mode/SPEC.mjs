//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SPEC for Awtsmoos Design OS — Shabbos Mode.
 * @description Shared interface shapes. Shabbos Mode turns any page into a still,
 * beautiful, fully-usable-without-JavaScript page: no animations, no interactive
 * elements, warm sefer-like typography, print-ready. The static version is not a
 * degraded experience — it is a holier one: focused, peaceful, restful.
 *
 * Data shapes:
 *
 * ShabbosOptions = {
 *   lat: number,                 // latitude in degrees (e.g. 31.7683 Jerusalem)
 *   lon: number,                 // longitude in degrees (e.g. 35.2137 Jerusalem)
 *   utcOffsetMin: number,        // local UTC offset in minutes (e.g. 180 for IDT)
 *   candleLightingMin?: number,  // minutes before sunset (default 18)
 *   havdalahMin?: number,        // minutes after Saturday sunset (default 50)
 *   autoEnable?: boolean,        // client: enter mode automatically in Shabbos (default true)
 *   offerBeforeMin?: number,     // client: offer mode this many minutes before (default 90)
 *   remember?: boolean,          // client: persist manual toggle in localStorage (default true)
 *   inlineScript?: boolean,      // html: inline the client script (default true)
 *   stripScripts?: boolean,      // html: remove other <script> tags (default false)
 *   expandSelectors?: string[],  // html: extra selectors forced visible in Shabbos CSS
 *   noticeText?: string,         // html: custom notice banner text
 * }
 *
 * ShabbosWindow = {
 *   candleLighting: Date,  // Friday candle lighting (UTC)
 *   havdalah: Date,        // Saturday nightfall / end of Shabbos (UTC)
 *   inShabbos: boolean,
 *   minutesToShabbos: number,   // negative when already in / past
 *   minutesToHavdalah: number,
 *   fridaySunset: Date,
 *   saturdaySunset: Date,
 * }
 *
 * Module functions:
 *   times.mjs:   sunsetUTCms(y, m, d, lat, lon) -> number (ms UTC)
 *                getShabbosWindow(opts) -> ShabbosWindow
 *   css.mjs:     shabbosCss(opts) -> string
 *                printCss(opts) -> string
 *   html.mjs:    applyShabbosHtml(html, opts) -> string
 *   script.mjs:  shabbosClientScript(opts) -> string (JS source for the browser)
 *   index.mjs:   renderShabbosPage(html, opts) -> string  (html + css + script)
 */

export const DEFAULTS = Object.freeze({
	candleLightingMin: 18,
	havdalahMin: 50,
	autoEnable: true,
	offerBeforeMin: 90,
	remember: true,
	inlineScript: true,
	stripScripts: false,
	expandSelectors: [],
});

export const STORAGE_KEY = "awt-shabbos-mode";
export const HTML_CLASS = "shabbos-mode";
