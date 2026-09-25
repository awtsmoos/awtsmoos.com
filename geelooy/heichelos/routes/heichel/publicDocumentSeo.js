//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publicDocumentSeo.js
 * @description
 * Gives secondary public Torah documents one shared social and structured-data vessel.
 * The Awtsmoos is one beyond every tag; Awtsmoos.com lets comment and translation
 * pages reveal the same canonical truth without copying a tangled metadata bag.
 */

const { escapeHtml } = require('../../../seo/html.js');

const SITE_ORIGIN = 'https://awtsmoos.com';
const RICH_ROBOTS = 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';

/** Escapes JSON so embedded public text cannot terminate its script vessel. */
function safeJson(value) {
	return JSON.stringify(value)
		.replace(/&/g, '\\u0026')
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e');
}

/** Renders factual Open Graph and Twitter tags from one canonical public model. */
function socialTags({ title, description, canonical, type = 'article' }) {
	const safeTitle = escapeHtml(title);
	const safeDescription = escapeHtml(description);
	const safeCanonical = escapeHtml(canonical);
	return [
		`<meta property="og:type" content="${escapeHtml(type)}">`,
		`<meta property="og:title" content="${safeTitle}">`,
		`<meta property="og:description" content="${safeDescription}">`,
		`<meta property="og:url" content="${safeCanonical}">`,
		'<meta property="og:site_name" content="Awtsmoos">',
		'<meta name="twitter:card" content="summary">',
		`<meta name="twitter:title" content="${safeTitle}">`,
		`<meta name="twitter:description" content="${safeDescription}">`
	].join('');
}

/** Wraps one factual schema payload in a uniquely marked JSON-LD script. */
function structuredDataTag(payload, marker) {
	return `<script type="application/ld+json" data-awtsmoos-${escapeHtml(marker)}>${safeJson(payload)}</script>`;
}

module.exports = {
	RICH_ROBOTS,
	SITE_ORIGIN,
	safeJson,
	socialTags,
	structuredDataTag
};
