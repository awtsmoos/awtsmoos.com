//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Server-side Yom Tov HTML transform.
 * @description Applies a Yom Tov mode to a full HTML document without client
 * JavaScript: class hooks, stylesheets, notice banner, <details> expansion.
 * Freeze days (Pesach/Sukkot/Shavuot/Yamim Noraim) also get .shabbos-mode so
 * the sibling stillness stylesheet applies; theme-only days (Chanukah, Purim,
 * Chol HaMoed, fasts) get the standalone Yom Tov surface. Fully usable with
 * JS disabled; the client script is progressive enhancement only.
 */

import { shabbosCss, printCss } from "../shabbos-mode/css.mjs";
import { HTML_CLASS as SHABBOS_HTML_CLASS } from "../shabbos-mode/SPEC.mjs";
import { yomtovThemeCss, yomtovSurfaceCss, YOMTOV_CLASS } from "./css.mjs";
import { yomtovClientScript } from "./script.mjs";
import { themeFor, noticeHtml } from "./themes.mjs";
import { DEFAULTS } from "./SPEC.mjs";

function escRe(s) {
	return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Add Yom Tov classes to <html> (merging with existing). Freeze days also
 * gain the shabbos-mode class so the stillness stylesheet applies.
 */
export function addYomTovClass(html, entry) {
	const freeze = themeFor(entry.mode).freeze;
	const extra = [YOMTOV_CLASS, `yomtov-${entry.mode}`, `yomtov-${entry.type}`]
		.concat(freeze ? [SHABBOS_HTML_CLASS] : [])
		.join(" ");
	return String(html).replace(/<html([^>]*)>/i, (m, attrs) => {
		const classMatch = attrs.match(/\bclass\s*=\s*(["'])(.*?)\1/i);
		if (classMatch) {
			const have = classMatch[2].split(/\s+/);
			for (const c of extra.split(" ")) if (!have.includes(c)) have.push(c);
			return `<html${attrs.replace(classMatch[0], `class=${classMatch[1]}${have.join(" ").trim()}${classMatch[1]}`)}>`;
		}
		return `<html${attrs} class="${extra}">`;
	});
}

/** Expand all <details> elements. */
export function expandDetails(html) {
	return String(html).replace(/<details(?![^>]*\bopen\b)([^>]*)>/gi, "<details$1 open>");
}

/** Remove <script> tags except data-yomtov-keep / data-shabbos-keep. */
export function stripScripts(html) {
	return String(html).replace(/<script(?![^>]*(?:\bdata-yomtov-keep\b|\bdata-shabbos-keep\b))[^>]*>[\s\S]*?<\/script\s*>/gi, "");
}

/** Inject a <style> block before </head>. */
export function injectStyle(html, css, id = "yomtov-mode") {
	const tag = `<style data-yomtov="${id}">\n${css}\n</style>`;
	if (/<\/head\s*>/i.test(html)) return String(html).replace(/<\/head\s*>/i, `${tag}\n</head>`);
	return `${tag}\n${html}`;
}

/** Insert the Yom Tov notice banner right after <body>. */
export function insertYomTovNotice(html, entry) {
	const div = `<div class="yomtov-notice" role="note">${noticeHtml(entry)}</div>`;
	if (/<body[^>]*>/i.test(html)) return String(html).replace(/(<body[^>]*>)/i, `$1\n${div}`);
	return `${div}\n${html}`;
}

/**
 * Stylesheet bundle for a holiday entry.
 * Freeze days: shabbos stillness + print + yomtov theme.
 * Theme-only days: yomtov surface + yomtov theme.
 */
export function yomtovStylesheet(entry, opts = {}) {
	const freeze = themeFor(entry.mode).freeze;
	const parts = [];
	if (freeze) {
		parts.push(shabbosCss(opts));
		parts.push(printCss(opts));
	} else {
		parts.push(yomtovSurfaceCss(opts));
	}
	parts.push(yomtovThemeCss(entry.mode, opts));
	return parts.join("\n");
}

/**
 * Apply the full Yom Tov transform to an HTML document.
 * @param {string} html Full HTML document.
 * @param {object} entry Holiday entry from holidays.mjs.
 * @param {object} [opts] YomTovOptions (see SPEC.mjs).
 */
export function applyYomTovHtml(html, entry, opts = {}) {
	if (!entry) throw new TypeError("applyYomTovHtml requires a holiday entry");
	const o = Object.assign({}, DEFAULTS, opts);
	let out = String(html);
	out = addYomTovClass(out, entry);
	out = expandDetails(out);
	if (o.stripScripts) out = stripScripts(out);
	out = injectStyle(out, yomtovStylesheet(entry, o));
	if (o.inlineScript) {
		const script = `<script data-yomtov-keep data-yomtov-client>\n${yomtovClientScript(o)}\n</script>`;
		if (/<\/body\s*>/i.test(out)) out = out.replace(/<\/body\s*>/i, `${script}\n</body>`);
		else out += `\n${script}`;
	}
	out = insertYomTovNotice(out, entry);
	return out;
}
