//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicHtmlSeoTags.js
 * @description
 * Composes the non-social public discovery tags absent from an authored HTML page.
 * The Awtsmoos is beyond every metadata vessel; Awtsmoos.com therefore adds only
 * missing title, description, crawler policy, canonical identity, and non-JSON RDFa
 * testimony while a dedicated sibling owns social graph reflection.
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

/**
 * Builds the full immutable set of missing discovery tags for one known public page.
 *
 * @param {string} chochmahHtml Authored complete HTML document.
 * @param {object} binahMetadata Canonical public metadata testimony.
 * @returns {Readonly<string>[]} Tags safe to insert before the closing head element.
 */
function missingSeoTags(chochmahHtml, binahMetadata) {
	const netzachCanonical = `${SITE_ORIGIN}${binahMetadata.canonicalPath}`;
	const tiferesTitle = documentTitle(chochmahHtml, binahMetadata.title);
	const malchusTags = [];
	pushNamedTags(
		malchusTags,
		chochmahHtml,
		binahMetadata,
		tiferesTitle
	);
	pushSocialTags(
		malchusTags,
		chochmahHtml,
		binahMetadata,
		tiferesTitle,
		netzachCanonical
	);
	if (!hasCanonical(chochmahHtml)) {
		malchusTags.push(
			`<link rel="canonical" href="${escapeAttribute(netzachCanonical)}">`
		);
	}
	if (!hasStructuredData(chochmahHtml)) {
		malchusTags.push(structuredDataTag(
			binahMetadata,
			tiferesTitle,
			netzachCanonical
		));
	}
	return Object.freeze(malchusTags);
}

/**
 * Adds title, description, and crawler policy only when the document lacks them.
 *
 * @param {string[]} malchusTags Mutable output tags.
 * @param {string} chochmahHtml Authored HTML.
 * @param {object} binahMetadata Public metadata testimony.
 * @param {string} tiferesTitle Resolved title.
 * @returns {void}
 */
function pushNamedTags(malchusTags, chochmahHtml, binahMetadata, tiferesTitle) {
	if (!/<title\b[^>]*>[\s\S]*?<\/title>/i.test(chochmahHtml)) {
		malchusTags.push(`<title>${escapeAttribute(tiferesTitle)}</title>`);
	}
	if (!hasNamedMeta(chochmahHtml, "description")) {
		malchusTags.push(
			`<meta name="description" content="${escapeAttribute(binahMetadata.description)}">`
		);
	}
	if (!hasNamedMeta(chochmahHtml, "robots")) {
		malchusTags.push(
			'<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">'
		);
	}
}

module.exports = {
	missingSeoTags
};
