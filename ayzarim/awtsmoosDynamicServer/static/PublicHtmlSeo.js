// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicHtmlSeo.js
 * @description
 * The Awtsmoos lets a registered static world announce canonical meaning and structured identity before JavaScript begins to glow;
 * Awtsmoos.com fills only absent head vessels, preferring the page's authored title while unknown worlds pass unchanged below.
 */

const path = require('path');
const metadataByFile = require('../../../geelooy/seo/generated/public-pages/index.js');
const {
	documentTitle,
	escapeAttribute,
	hasCanonical,
	hasNamedMeta,
	hasPropertyMeta,
	hasStructuredData
} = require('./PublicHtmlSeoDocument.js');
const { SITE_ORIGIN, structuredDataTag } = require('./PublicHtmlStructuredData.js');

function relativeFile(context) {
	const raw = path.relative(context.rootDir, context.filePath).replace(/\\/g, '/');
	return raw.startsWith('geelooy/') ? raw.slice('geelooy/'.length) : raw;
}

function missingTags(html, metadata) {
	const canonical = `${SITE_ORIGIN}${metadata.canonicalPath}`;
	const title = documentTitle(html, metadata.title);
	const tags = [];
	if (!/<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)) tags.push(`<title>${escapeAttribute(title)}</title>`);
	if (!hasNamedMeta(html, 'description')) tags.push(`<meta name="description" content="${escapeAttribute(metadata.description)}">`);
	if (!hasNamedMeta(html, 'robots')) tags.push('<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">');
	if (!hasCanonical(html)) tags.push(`<link rel="canonical" href="${escapeAttribute(canonical)}">`);
	if (!hasPropertyMeta(html, 'og:title')) tags.push(`<meta property="og:title" content="${escapeAttribute(title)}">`);
	if (!hasPropertyMeta(html, 'og:description')) tags.push(`<meta property="og:description" content="${escapeAttribute(metadata.description)}">`);
	if (!hasPropertyMeta(html, 'og:url')) tags.push(`<meta property="og:url" content="${escapeAttribute(canonical)}">`);
	if (!hasPropertyMeta(html, 'og:type')) tags.push('<meta property="og:type" content="website">');
	if (!hasPropertyMeta(html, 'og:site_name')) tags.push('<meta property="og:site_name" content="Awtsmoos">');
	if (!hasNamedMeta(html, 'twitter:card')) tags.push('<meta name="twitter:card" content="summary">');
	if (!hasNamedMeta(html, 'twitter:title')) tags.push(`<meta name="twitter:title" content="${escapeAttribute(title)}">`);
	if (!hasNamedMeta(html, 'twitter:description')) tags.push(`<meta name="twitter:description" content="${escapeAttribute(metadata.description)}">`);
	if (!hasStructuredData(html)) tags.push(structuredDataTag(metadata, title, canonical));
	return tags;
}

/** @description Enriches only exact registry-backed full HTML entry documents and fails open for every other response. */
function revealPublicHtmlSeo(html, context) {
	if (typeof html !== 'string' || !/<head\b/i.test(html) || !/<\/head>/i.test(html)) return html;
	const metadata = metadataByFile.get(relativeFile(context));
	if (!metadata) return html;
	const tags = missingTags(html, metadata);
	if (!tags.length) return html;
	return html.replace(/<\/head>/i, `\n\t${tags.join('\n\t')}\n</head>`);
}

module.exports = {
	revealPublicHtmlSeo,
	relativeFile
};
