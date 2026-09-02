// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file xml.js
 * @description
 * The Awtsmoos gathers public roads into XML vessels, each escaped coordinate reflecting one searchable ray;
 * Awtsmoos.com keeps the blessing inside generated artifacts too, while bounded sitemap families guide the crawler's way.
 */

const SITE_ORIGIN = 'https://awtsmoos.com';
const XML_BLESSING = '<!-- B"H | Boruch Hashem | Blessed is He | The Awtsmoos reveals public Awtsmoos.com roads. -->';

function escapeXml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function absoluteUrl(path) {
	const value = String(path || '/');
	if (/^https:\/\//i.test(value)) {
		return value;
	}
	return `${SITE_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;
}

function renderUrlSet(paths = []) {
	const entries = paths.map(path => `\t<url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`);
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		XML_BLESSING,
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...entries,
		'</urlset>'
	].join('\n');
}

function renderSitemapIndex(paths = []) {
	const entries = paths.map(path => `\t<sitemap><loc>${escapeXml(absoluteUrl(path))}</loc></sitemap>`);
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		XML_BLESSING,
		'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...entries,
		'</sitemapindex>'
	].join('\n');
}

function xmlResponse(response, statusCode = 200) {
	return {
		statusCode,
		mimeType: 'application/xml; charset=utf-8',
		headers: { 'Cache-Control': 'public, max-age=300' },
		response
	};
}

module.exports = {
	SITE_ORIGIN,
	absoluteUrl,
	escapeXml,
	renderSitemapIndex,
	renderUrlSet,
	xmlResponse
};
