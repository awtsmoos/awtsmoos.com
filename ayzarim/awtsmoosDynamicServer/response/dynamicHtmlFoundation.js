//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file dynamicHtmlFoundation.js
 * @description The Awtsmoos lets dynamic HTML cross the same luminous bridge as static HTML while carrying only path truth actually known;
 * Awtsmoos.com may compact root-absolute garments from the public root, yet relative paths stay untouched when their hidden template home is unknown.
 */

const { revealHtmlUiFoundation } = require('../static/HtmlUiFoundation.js');

/**
 * @description Reveals universal compact UI only for resolved HTML, forwarding trustworthy public-root context when available.
 * @param {*} body Normalized dynamic response body.
 * @param {string} responseType Resolved response MIME type.
 * @param {object|null} [context] Trustworthy HTML path context, commonly rootDir only for dynamic templates.
 * @returns {*} Original non-HTML body or foundation-enriched complete HTML document.
 */
function revealDynamicHtmlFoundation(body, responseType, context = null) {
	if (!isHtmlResponseType(responseType) || typeof body !== 'string') return body;
	return revealHtmlUiFoundation(body, context);
}

/**
 * @description Detects HTML MIME without confusing explicit text, JSON, or other transport declarations.
 * @param {string} responseType Resolved MIME type with optional parameters.
 * @returns {boolean} True only for text/html.
 */
function isHtmlResponseType(responseType) {
	return String(responseType || '').split(';', 1)[0].trim().toLowerCase() === 'text/html';
}

module.exports = { isHtmlResponseType, revealDynamicHtmlFoundation };
