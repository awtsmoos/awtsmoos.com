//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Yom Tov Modes client script generator.
 * @description Builds the browser-side JavaScript. It embeds the pure Hebrew
 * calendar + holiday functions verbatim (via toString, so server and client
 * can never drift), plus sunsetUTCms from shabbos-mode, then adds: automatic
 * Yom Tov detection by location, a gentle "the festival approaches" offer
 * banner, a manual toggle, and localStorage persistence. Progressive
 * enhancement only — html.mjs already applied the server-side transform.
 */

import {
	HEBREW_EPOCH,
	isHebrewLeapYear, hebrewNewYearDays, hebrewNewYearRD, hebrewYearLength,
	hebrewMonthLength, hebrewToRD, rdToHebrew,
	isGregorianLeapYear, gregorianToRD, rdToGregorian, rdWeekday,
} from "./calendar.mjs";
import {
	holidaysInHebrewYear, yomTovAtRD, yomTovAtDate, getYomTovWindow,
} from "./holidays.mjs";
import { deg2rad, rad2deg, sunsetUTCms } from "../shabbos-mode/times.mjs";
import { MODES } from "./themes.mjs";
import { STORAGE_KEY, YOMTOV_HTML_CLASS, DEFAULTS } from "./SPEC.mjs";

// Module-scope consts referenced by the embedded pure functions.
const EMBED_CONSTS = {
	HEBREW_EPOCH,
	PARTS_PER_HOUR: 1080,
	PARTS_PER_DAY: 25920,
	LUNATION_PARTS: 765433,
	EPOCH_MOLAD_PARTS: 5604,
};

const EMBED_FNS = [
	isHebrewLeapYear, hebrewNewYearDays, hebrewNewYearRD, hebrewYearLength,
	hebrewMonthLength, hebrewToRD, rdToHebrew,
	isGregorianLeapYear, gregorianToRD, rdToGregorian, rdWeekday,
	holidaysInHebrewYear, yomTovAtRD, yomTovAtDate, getYomTovWindow,
	deg2rad, rad2deg, sunsetUTCms,
];

// Non-exported helpers (monthsBeforeYear, jewishWeekday, isShabbos) are
// referenced by embedded functions — include their sources too.
import * as calNs from "./calendar.mjs";
import * as holNs from "./holidays.mjs";

function fnSrc(fn) {
	const s = fn.toString();
	// toString of `export function` drops the export keyword already; but
	// function *declarations* nested in module scope stringify fine.
	return s;
}

/**
 * Generate the client-side Yom Tov script source.
 * Config is read from window.AWT_YOMTOV or <html data-yomtov-*> attributes,
 * overridden by the baked-in opts below.
 */
export function yomtovClientScript(opts = {}) {
	const o = Object.assign({}, DEFAULTS, opts);

	const constsSrc = Object.entries(EMBED_CONSTS)
		.map(([k, v]) => `var ${k} = ${JSON.stringify(v)};`)
		.join("\n");

	// Pull the non-exported helpers by re-declaring from known source.
	// (They are small; duplicating keeps the client bundle self-contained.)
	const helpersSrc = `
function monthsBeforeYear(y) { return Math.floor((235 * y - 234) / 19); }
function jewishWeekday(d) { return (((d + 1) % 7) + 7) % 7; }
function isShabbos(rd) { return rdWeekday(rd) === 6; }
`;

	const fnsSrc = EMBED_FNS.map(fnSrc).join("\n\n");
	const modesJson = JSON.stringify(MODES);

	const baked = JSON.stringify({
		lat: typeof o.lat === "number" ? o.lat : null,
		lon: typeof o.lon === "number" ? o.lon : null,
		diaspora: o.diaspora !== false,
		autoEnable: o.autoEnable !== false,
		offerBeforeMin: typeof o.offerBeforeMin === "number" ? o.offerBeforeMin : DEFAULTS.offerBeforeMin,
		remember: o.remember !== false,
	});

	return `/* B"H — Yom Tov Modes client. Every festival, its own soul. */
(function () {
"use strict";
${constsSrc}

${helpersSrc}

${fnsSrc}

var MODES = ${modesJson};
var BAKED = ${baked};
var YT_CLASS = ${JSON.stringify(YOMTOV_HTML_CLASS)};
var SHABBOS_CLASS = "shabbos-mode";
var KEY = ${JSON.stringify(STORAGE_KEY)};

function readConfig() {
	var cfg = {};
	try {
		if (window.AWT_YOMTOV && typeof window.AWT_YOMTOV === "object") {
			for (var k in window.AWT_YOMTOV) cfg[k] = window.AWT_YOMTOV[k];
		}
	} catch (e) {}
	var el = document.documentElement;
	function attr(name) {
		var v = el.getAttribute("data-yomtov-" + name);
		return v === null ? undefined : v;
	}
	var lat = attr("lat"), lon = attr("lon");
	if (lat !== undefined) cfg.lat = parseFloat(lat);
	if (lon !== undefined) cfg.lon = parseFloat(lon);
	var dia = attr("diaspora");
	if (dia !== undefined) cfg.diaspora = dia !== "false" && dia !== "0";
	for (var k2 in BAKED) if (cfg[k2] === undefined || cfg[k2] === null) cfg[k2] = BAKED[k2];
	return cfg;
}

function utcOffsetMin() { return -new Date().getTimezoneOffset(); }

function window_(cfg) {
	if (typeof cfg.lat !== "number" || typeof cfg.lon !== "number"
		|| !isFinite(cfg.lat) || !isFinite(cfg.lon)) return null;
	try {
		return getYomTovWindow({
			lat: cfg.lat, lon: cfg.lon, now: new Date(),
			utcOffsetMin: utcOffsetMin(), sunsetUTCms: sunsetUTCms,
			holidayOpts: { diaspora: cfg.diaspora !== false }
		});
	} catch (e) { return null; }
}

function modeClasses(entry) {
	var cls = [YT_CLASS, "yomtov-" + entry.mode, "yomtov-" + entry.type];
	if (MODES[entry.mode] && MODES[entry.mode].freeze) cls.push(SHABBOS_CLASS);
	return cls;
}

function setMode(entry, remember) {
	var el = document.documentElement;
	if (!entry) {
		el.classList.remove(YT_CLASS, SHABBOS_CLASS);
		return;
	}
	var keep = [];
	for (var i = 0; i < el.classList.length; i++) {
		var c = el.classList[i];
		if (c.indexOf("yomtov-") !== 0) keep.push(c);
	}
	// rebuild: keep non-yomtov classes, drop old yomtov-* + shabbos (server may re-add)
	var classes = {};
	for (var j = 0; j < keep.length; j++) classes[keep[j]] = 1;
	var add = modeClasses(entry);
	for (var k = 0; k < add.length; k++) classes[add[k]] = 1;
	el.className = Object.keys(classes).join(" ");
	try {
		if (remember !== false) localStorage.setItem(KEY, JSON.stringify({ mode: entry.mode, type: entry.type }));
	} catch (e) {}
}

function remembered() {
	try {
		var v = localStorage.getItem(KEY);
		return v ? JSON.parse(v) : null;
	} catch (e) { return null; }
}

function offerBanner(text) {
	if (document.getElementById("yomtov-offer")) return;
	var bar = document.createElement("div");
	bar.id = "yomtov-offer";
	bar.setAttribute("role", "dialog");
	bar.setAttribute("aria-label", "Yom Tov approaching");
	bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;"
		+ "background:#2e2318;color:#f5ecd9;font-family:Georgia,serif;"
		+ "padding:14px 18px;text-align:center;font-size:16px;line-height:1.5;"
		+ "border-top:3px double #c9a227;box-shadow:0 -4px 24px rgba(0,0,0,.35);";
	bar.innerHTML = text
		+ ' <button id="yomtov-offer-yes" style="margin:0 8px;padding:8px 18px;font-size:15px;'
		+ 'background:#c9a227;color:#2e2318;border:none;border-radius:4px;cursor:pointer;'
		+ 'font-family:Georgia,serif;">Enter Yom Tov mode</button>'
		+ '<button id="yomtov-offer-no" aria-label="Dismiss" style="background:none;border:none;'
		+ 'color:#f5ecd9;font-size:18px;cursor:pointer;">✕</button>';
	document.body.appendChild(bar);
	document.getElementById("yomtov-offer-yes").addEventListener("click", function () {
		var w = window.__yomtovPending;
		if (w) setMode(w, true);
		bar.remove();
	});
	document.getElementById("yomtov-offer-no").addEventListener("click", function () { bar.remove(); });
}

function wireToggle() {
	document.addEventListener("click", function (ev) {
		var t = ev.target && ev.target.closest ? ev.target.closest(".yomtov-toggle") : null;
		if (!t) return;
		ev.preventDefault();
		var el = document.documentElement;
		if (el.classList.contains(YT_CLASS)) {
			el.classList.remove(YT_CLASS, SHABBOS_CLASS);
			try { localStorage.setItem(KEY, "0"); } catch (e) {}
		} else {
			var w = window.__yomtovPending;
			if (w) setMode(w, true);
		}
	});
}

function init() {
	var cfg = readConfig();
	wireToggle();
	var mem = remembered();
	if (mem === "0") return; // user explicitly opted out
	var w = window_(cfg);
	if (!w) return;
	if (w.current && w.current.type !== "erev") {
		window.__yomtovPending = w.current;
		if (mem && mem.mode) {
			// honor a remembered mode from earlier today
			return;
		}
		if (cfg.autoEnable && !document.documentElement.classList.contains(YT_CLASS)) {
			setMode(w.current, false);
		}
		return;
	}
	var upcoming = null, label = "";
	if (w.current && w.current.type === "erev") {
		upcoming = w.current;
		label = "🌟 Erev " + (MODES[w.current.mode] ? MODES[w.current.mode].en : "Yom Tov")
			+ " begins tonight. ";
	} else if (w.next && w.nextInDays <= 1) {
		upcoming = w.next;
		label = (MODES[w.next.mode] ? MODES[w.next.mode].emoji + " " : "")
			+ (MODES[w.next.mode] ? MODES[w.next.mode].en : "Yom Tov")
			+ " begins " + (w.nextInDays === 0 ? "today" : "tomorrow") + ". ";
	}
	if (upcoming) {
		window.__yomtovPending = upcoming.type === "erev"
			? { mode: upcoming.mode, type: "yomtov" } : upcoming;
		offerBanner(label + "Prepare with joy.");
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
})();
`;
}

// Keep linters honest: these imports are used via toString embedding.
void calNs; void holNs;
