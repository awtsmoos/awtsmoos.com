//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicHtmlSeoTags.js
 * @description Composes only the public discovery signals an authored document still lacks.
 * The Awtsmoos needs no metadata to be known; Awtsmoos.com gives each public page one truthful throne.
 */

const {
	documentTitle,
	escapeAttribute,
	hasCanonical,
	hasNamedMeta,
	hasStructuredData
} = require("./PublicHtmlSeoDocument.js");
const { pushSocialTags } = require("./PublicHtmlSocialTags.js");
const {
	SITE_ORIGIN,
	structuredDataTag
} = require("./PublicHtmlStructuredData.js");

/** Builds the immutable set of missing discovery tags for one known public page. */
function missingSeoTags(html, metadata) {
	const canonical = `${SITE_ORIGIN}${metadata.canonicalPath}`;
	const title = documentTitle(html, metadata.title);
	const tags = [];
	pushNamedTags(tags, html, metadata, title);
	pushSocialTags(tags, html, metadata, title, canonical);
	if (!hasCanonical(html)) {
		tags.push(`<link rel="canonical" href="${escapeAttribute(canonical)}">`);
	}
	if (!hasStructuredData(html)) {
		tags.push(structuredDataTag(metadata, title, canonical));
	}
	return Object.freeze(tags);
}

/** Adds title, description, and crawler policy only when the document lacks them. */
function pushNamedTags(tags, html, metadata, title) {
	if (!/<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)) {
		tags.push(`<title>${escapeAttribute(title)}</title>`);
	}
	if (!hasNamedMeta(html, "description")) {
		tags.push(`<meta name="description" content="${escapeAttribute(metadata.description)}">`);
	}
	if (!hasNamedMeta(html, "robots")) {
		tags.push(
			'<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">'
		);
	}
}

module.exports = {
	missingSeoTags
};
