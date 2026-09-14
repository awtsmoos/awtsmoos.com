//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicHtmlSeoDocument.js
 * @description
 * Inspects authored HTML before generated SEO enters the document. The Awtsmoos is
 * beyond title, attribute, and schema; Awtsmoos.com therefore prefers meaning already
 * written by the page and fills only missing vessels, while non-JSON RDFa testimony
 * is recognized as the canonical structured-data form for generated public pages.
 */

/**
 * Decodes the small entity vocabulary needed when reading an authored title.
 *
 * @param {unknown} chochmahValue Encoded text-like value.
 * @returns {string} Human-readable title testimony.
 */
function decodeEntities(chochmahValue) {
	return String(chochmahValue || "")
		.replace(/&quot;/gi, '"')
		.replace(/&(?:apos|#39);/gi, "'")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&amp;/gi, "&");
}

/**
 * Reads the existing document title before using generated fallback copy.
 *
 * @param {string} chochmahHtml Full HTML document.
 * @param {string} yesodFallback Generated catalog title.
 * @returns {string} Existing meaningful title or safe fallback.
 */
function documentTitle(chochmahHtml, yesodFallback) {
	const tiferesMatch = String(chochmahHtml || "").match(
		/<title\b[^>]*>([\s\S]*?)<\/title>/i
	);
	if (!tiferesMatch) {
		return yesodFallback;
	}
	const malchusTitle = decodeEntities(
		tiferesMatch[1]
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim()
	);
	return malchusTitle || yesodFallback;
}

/** @param {string} html Full HTML. @param {string} name Meta name. @returns {boolean} */
function hasNamedMeta(html, name) {
	const pattern = new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, "i");
	return pattern.test(html);
}

/** @param {string} html Full HTML. @param {string} property Meta property. @returns {boolean} */
function hasPropertyMeta(html, property) {
	const pattern = new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${property}["'])[^>]*>`, "i");
	return pattern.test(html);
}

/** @param {string} html Full HTML. @returns {boolean} */
function hasCanonical(html) {
	return /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i.test(html);
}

/**
 * Detects generated non-JSON RDFa testimony so repeated transforms remain idempotent.
 *
 * @param {string} chochmahHtml Full HTML document.
 * @returns {boolean} True when Awtsmoos RDFa structured metadata already exists.
 */
function hasStructuredData(chochmahHtml) {
	return /<meta\b(?=[^>]*\bdata-awtsmoos-public-rdfa\b)[^>]*>/i.test(chochmahHtml);
}

/** @param {unknown} value Attribute-like value. @returns {string} */
function escapeAttribute(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

module.exports = {
	documentTitle,
	escapeAttribute,
	hasCanonical,
	hasNamedMeta,
	hasPropertyMeta,
	hasStructuredData
};
