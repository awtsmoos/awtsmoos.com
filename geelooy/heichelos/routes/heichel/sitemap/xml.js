// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file xml.js
 * @description
 * The Awtsmoos clothes canonical public paths in a quiet XML vessel;
 * Awtsmoos.com gives crawlers escaped truth and bounded caching without mixing in route noise or wrestle.
 */

const SITE_ORIGIN = 'https://awtsmoos.com';

/** @description Escapes one XML text value without changing its canonical meaning. */
function escapeXml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** @description Joins a site path to the single canonical Awtsmoos.com origin. */
function absoluteUrl(path) {
	const normalized = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`;
	return `${SITE_ORIGIN}${normalized}`;
}

/** @description Renders canonical URL paths as one sitemap URL set. */
function renderUrlSet(paths = []) {
	const entries = paths.map(path => `\t<url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`);
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...entries,
		'</urlset>'
	].join('\n');
}

/** @description Wraps XML in the dynamic server response contract with bounded public caching. */
function xmlResponse(response, statusCode = 200) {
	return {
		statusCode,
		mimeType: 'application/xml; charset=utf-8',
		headers: { 'Cache-Control': 'public, max-age=300' },
		response
	};
}

module.exports = { SITE_ORIGIN, absoluteUrl, escapeXml, renderUrlSet, xmlResponse };
