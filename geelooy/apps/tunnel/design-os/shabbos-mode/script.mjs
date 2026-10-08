//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Shabbos Mode client script generator.
 * @description Builds the browser-side JavaScript. It embeds the pure time
 * functions from times.mjs verbatim (via toString, so server and client can
 * never drift), then adds: automatic Shabbos detection by location, a gentle
 * "Shabbos is approaching" offer banner, a manual toggle, and localStorage
 * persistence. The script is progressive enhancement only — the page is fully
 * usable with JS disabled because html.mjs already applied the transform.
 */

import { deg2rad, rad2deg, sunsetUTCms, getShabbosWindow } from "./times.mjs";
import { STORAGE_KEY, HTML_CLASS, DEFAULTS } from "./SPEC.mjs";

function escOpt(v, fallback) {
	return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

/**
 * Generate the client-side Shabbos script source.
 * Config is read from window.AWT_SHABBOS or <html data-shabbos-*> attributes,
 * overridden by the baked-in opts below.
 * @param {object} [opts] ShabbosOptions (see SPEC.mjs).
 * @returns {string} JavaScript source for the browser.
 */
export function shabbosClientScript(opts = {}) {
	const o = Object.assign({}, DEFAULTS, opts);
	const embedded = [deg2rad, rad2deg, sunsetUTCms, getShabbosWindow]
		.map((fn) => fn.toString())
		.join("\n\n");

	const baked = JSON.stringify({
		lat: typeof o.lat === "number" ? o.lat : null,
		lon: typeof o.lon === "number" ? o.lon : null,
		candleLightingMin: escOpt(o.candleLightingMin, DEFAULTS.candleLightingMin),
		havdalahMin: escOpt(o.havdalahMin, DEFAULTS.havdalahMin),
		autoEnable: o.autoEnable !== false,
		offerBeforeMin: escOpt(o.offerBeforeMin, DEFAULTS.offerBeforeMin),
		remember: o.remember !== false,
	});

	return `/* B"H — Shabbos Mode client. Stillness, automatically. */
(function () {
"use strict";
${embedded}

var BAKED = ${baked};
var CLASS = ${JSON.stringify(HTML_CLASS)};
var KEY = ${JSON.stringify(STORAGE_KEY)};

function readConfig() {
	var cfg = {};
	try {
		if (window.AWT_SHABBOS && typeof window.AWT_SHABBOS === "object") {
			for (var k in window.AWT_SHABBOS) cfg[k] = window.AWT_SHABBOS[k];
		}
	} catch (e) {}
	var el = document.documentElement;
	function attr(name) {
		var v = el.getAttribute("data-shabbos-" + name);
		return v === null ? undefined : v;
	}
	var lat = attr("lat"), lon = attr("lon");
	if (lat !== undefined) cfg.lat = parseFloat(lat);
	if (lon !== undefined) cfg.lon = parseFloat(lon);
	for (var k2 in BAKED) if (cfg[k2] === undefined || cfg[k2] === null) cfg[k2] = BAKED[k2];
	return cfg;
}

function utcOffsetMin() {
	return -new Date().getTimezoneOffset();
}

function state(cfg) {
	if (typeof cfg.lat !== "number" || typeof cfg.lon !== "number"
		|| !isFinite(cfg.lat) || !isFinite(cfg.lon)) return null;
	try {
		return getShabbosWindow({
			lat: cfg.lat, lon: cfg.lon, now: new Date(),
			utcOffsetMin: utcOffsetMin(),
			candleLightingMin: cfg.candleLightingMin,
			havdalahMin: cfg.havdalahMin
		});
	} catch (e) { return null; }
}

function setMode(on, remember) {
	document.documentElement.classList.toggle(CLASS, !!on);
	try {
		if (remember !== false) localStorage.setItem(KEY, on ? "1" : "0");
	} catch (e) {}
}

function remembered() {
	try { return localStorage.getItem(KEY); } catch (e) { return null; }
}

function offerBanner(minutesLeft) {
	if (document.getElementById("shabbos-offer")) return;
	var mins = Math.max(1, Math.round(minutesLeft));
	var bar = document.createElement("div");
	bar.id = "shabbos-offer";
	bar.setAttribute("role", "dialog");
	bar.setAttribute("aria-label", "Shabbos is approaching");
	bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;"
		+ "background:#2e2318;color:#f5ecd9;font-family:Georgia,serif;"
		+ "padding:14px 18px;text-align:center;font-size:16px;line-height:1.5;"
		+ "border-top:3px double #c9a227;box-shadow:0 -4px 24px rgba(0,0,0,.35);";
	bar.innerHTML = '<span aria-hidden="true">🕯️🕯️</span> '
		+ 'Shabbos begins in about ' + mins + ' minutes. '
		+ '<button id="shabbos-offer-yes" style="margin:0 8px;padding:8px 18px;font-size:15px;'
		+ 'background:#c9a227;color:#2e2318;border:none;border-radius:4px;cursor:pointer;'
		+ 'font-family:Georgia,serif;">Enter Shabbos mode</button>'
		+ '<button id="shabbos-offer-no" aria-label="Dismiss" style="background:none;border:none;'
		+ 'color:#f5ecd9;font-size:18px;cursor:pointer;">✕</button>';
	document.body.appendChild(bar);
	document.getElementById("shabbos-offer-yes").addEventListener("click", function () {
		setMode(true, true);
		bar.remove();
	});
	document.getElementById("shabbos-offer-no").addEventListener("click", function () {
		bar.remove();
	});
}

function wireToggle() {
	document.addEventListener("click", function (ev) {
		var t = ev.target && ev.target.closest ? ev.target.closest(".shabbos-toggle") : null;
		if (!t) return;
		ev.preventDefault();
		setMode(!document.documentElement.classList.contains(CLASS), true);
	});
}

function init() {
	var cfg = readConfig();
	wireToggle();
	var mem = remembered();
	if (mem === "1" && !document.documentElement.classList.contains(CLASS)) {
		setMode(true, true);
		return;
	}
	if (mem === "0") return; // user explicitly opted out
	var st = state(cfg);
	if (!st) return;
	if (st.inShabbos) {
		if (cfg.autoEnable) setMode(true, false);
		return;
	}
	if (st.minutesToShabbos > 0 && st.minutesToShabbos <= cfg.offerBeforeMin) {
		offerBanner(st.minutesToShabbos);
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
