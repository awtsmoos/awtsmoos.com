// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicHtmlSeoDocument.js
 * @description
 * The Awtsmoos listens first to meaning a page already authored, never replacing a true title with a weaker borrowed name;
 * Awtsmoos.com inspects the head through small pure helpers, so generated light enters only where an empty vessel remains.
 */

function decodeEntities(value) {
	return String(value || '')
		.replace(/&quot;/gi, '"')
		.replace(/&(?:apos|#39);/gi, "'")
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&amp;/gi, '&');
}

function documentTitle(html, fallback) {
	const match = String(html || '').match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
	if (!match) return fallback;
	const title = decodeEntities(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
	return title || fallback;
}

function hasNamedMeta(html, name) {
	const pattern = new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, 'i');
	return pattern.test(html);
}

function hasPropertyMeta(html, property) {
	const pattern = new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${property}["'])[^>]*>`, 'i');
	return pattern.test(html);
}

function hasCanonical(html) {
	return /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i.test(html);
}

function hasStructuredData(html) {
	return /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>/i.test(html);
}

function escapeAttribute(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

module.exports = {
	documentTitle,
	escapeAttribute,
	hasCanonical,
	hasNamedMeta,
	hasPropertyMeta,
	hasStructuredData
};
