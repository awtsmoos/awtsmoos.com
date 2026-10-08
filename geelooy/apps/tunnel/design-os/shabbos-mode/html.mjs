//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Server-side Shabbos HTML transform.
 * @description Applies Shabbos Mode to a full HTML document without any client
 * JavaScript: injects the .shabbos-mode class, the Shabbos stylesheet, an
 * optional inline client script (progressive enhancement only), a Shabbos
 * notice banner, and expands <details> elements. Fully usable with JS disabled.
 */

import { shabbosCss, printCss } from "./css.mjs";
import { shabbosClientScript } from "./script.mjs";
import { HTML_CLASS, DEFAULTS } from "./SPEC.mjs";

/**
 * Add the shabbos-mode class to the <html> tag, merging with existing classes.
 * @param {string} html Full HTML document.
 * @returns {string}
 */
export function addShabbosClass(html) {
	return String(html).replace(/<html([^>]*)>/i, (m, attrs) => {
		if (new RegExp(`\\b${HTML_CLASS}\\b`).test(attrs)) return m;
		const classMatch = attrs.match(/\bclass\s*=\s*(["'])(.*?)\1/i);
		if (classMatch) {
			const merged = `${classMatch[2]} ${HTML_CLASS}`.trim();
			return `<html${attrs.replace(classMatch[0], `class=${classMatch[1]}${merged}${classMatch[1]}`)}>`;
		}
		return `<html${attrs} class="${HTML_CLASS}">`;
	});
}

/**
 * Expand all <details> elements (add the open attribute).
 * @param {string} html
 * @returns {string}
 */
export function expandDetails(html) {
	return String(html).replace(/<details(?![^>]*\bopen\b)([^>]*)>/gi, "<details$1 open>");
}

/**
 * Remove <script> tags except those marked data-shabbos-keep.
 * @param {string} html
 * @returns {string}
 */
export function stripScripts(html) {
	return String(html).replace(/<script(?![^>]*\bdata-shabbos-keep\b)[^>]*>[\s\S]*?<\/script\s*>/gi, "");
}

/**
 * Inject a <style> block before </head> (or at the top if no head).
 * @param {string} html
 * @param {string} css
 * @param {string} [id="shabbos-mode"]
 * @returns {string}
 */
export function injectStyle(html, css, id = "shabbos-mode") {
	const tag = `<style data-shabbos="${id}">\n${css}\n</style>`;
	if (/<\/head\s*>/i.test(html)) return String(html).replace(/<\/head\s*>/i, `${tag}\n</head>`);
	return `${tag}\n${html}`;
}

/**
 * Insert the Shabbos notice banner right after <body>.
 * @param {string} html
 * @param {string} [text] Custom notice text (HTML allowed).
 * @returns {string}
 */
export function insertNotice(html, text) {
	const notice = text || `<span class="shabbos-candle" aria-hidden="true">🕯️🕯️</span> שבת שלום · Shabbos mode — a still page, prepared for rest`;
	const div = `<div class="shabbos-notice" role="note">${notice}</div>`;
	if (/<body[^>]*>/i.test(html)) return String(html).replace(/(<body[^>]*>)/i, `$1\n${div}`);
	return `${div}\n${html}`;
}

/**
 * Apply the full Shabbos transform to an HTML document.
 * @param {string} html Full HTML document.
 * @param {object} [opts] ShabbosOptions (see SPEC.mjs).
 * @returns {string} Transformed HTML.
 */
export function applyShabbosHtml(html, opts = {}) {
	const o = Object.assign({}, DEFAULTS, opts);
	let out = String(html);

	out = addShabbosClass(out);
	out = expandDetails(out);
	if (o.stripScripts) out = stripScripts(out);

	const css = shabbosCss(o) + "\n" + printCss(o);
	out = injectStyle(out, css);

	if (o.inlineScript) {
		const script = `<script data-shabbos-keep data-shabbos-client>\n${shabbosClientScript(o)}\n</script>`;
		if (/<\/body\s*>/i.test(out)) out = out.replace(/<\/body\s*>/i, `${script}\n</body>`);
		else out += `\n${script}`;
	}

	out = insertNotice(out, o.noticeText);
	return out;
}
