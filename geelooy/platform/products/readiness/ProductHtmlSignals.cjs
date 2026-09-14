//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProductHtmlSignals
 * @description
 * Reads deterministic metadata evidence from either authored or server-revealed HTML.
 * The readiness layer can therefore distinguish source debt from defects users
 * actually receive after the universal Awtsmoos response foundation is applied.
 */

const fs = require("fs");

/**
 * Reads one HTML file and delegates to the source-level signal extractor.
 * @param {string} filePath Absolute index.html path.
 * @returns {Readonly<object>} Immutable readiness evidence.
 */
function readHtmlSignals(filePath) {
	return readHtmlSignalsFromSource(fs.readFileSync(filePath, "utf8"));
}

/**
 * Extracts production-facing HTML readiness signals from supplied markup.
 * @param {string} html Complete or partial HTML source.
 * @returns {Readonly<object>} Immutable metadata signal record.
 */
function readHtmlSignalsFromSource(html) {
	return Object.freeze({
		title: matchText(html, /<title[^>]*>([^<]+)<\/title>/i),
		description: matchAttr(html, /<meta\b[^>]*name=["']description["'][^>]*>/i, "content"),
		viewport: matchAttr(html, /<meta\b[^>]*name=["']viewport["'][^>]*>/i, "content"),
		themeColor: matchAttr(html, /<meta\b[^>]*name=["']theme-color["'][^>]*>/i, "content"),
		completeDocument: /^\s*(?:<!--[\s\S]*?-->\s*)*(?:<!doctype html|<html)/i.test(html),
		rawOptOut: /data-g-ui-raw/i.test(html),
		hasIcon: /<link\b[^>]*rel=["'][^"']*icon/i.test(html),
		hasManifest: /<link\b[^>]*rel=["']manifest["']/i.test(html),
		hasModuleScript: /<script\b[^>]*type=["']module["']/i.test(html),
		hasViewportFit: /viewport-fit\s*=\s*cover/i.test(html),
		inlineScriptCount: (html.match(/<script\b(?![^>]*\bsrc=)[^>]*>/gi) || []).length,
		stylesheetCount: (html.match(/<link\b[^>]*rel=["']stylesheet["']/gi) || []).length
	});
}

/** @param {string} source HTML source. @param {RegExp} pattern Capture pattern. @returns {string} Captured text. */
function matchText(source, pattern) {
	return String(source.match(pattern)?.[1] || "").trim();
}

/** @param {string} source HTML source. @param {RegExp} tagPattern Tag pattern. @param {string} attribute Attribute name. @returns {string} Attribute value. */
function matchAttr(source, tagPattern, attribute) {
	const tag = source.match(tagPattern)?.[0] || "";
	const match = tag.match(new RegExp(`${attribute}=["']([^"']*)["']`, "i"));
	return String(match?.[1] || "").trim();
}

module.exports = {
	readHtmlSignals,
	readHtmlSignalsFromSource
};
