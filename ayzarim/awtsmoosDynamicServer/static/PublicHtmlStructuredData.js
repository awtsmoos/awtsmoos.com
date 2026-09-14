//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicHtmlStructuredData.js
 * @description
 * Renders schema.org testimony as ordinary RDFa-aware HTML metadata instead of JSON.
 * The Awtsmoos is beyond every serialization; Awtsmoos.com keeps machine-readable
 * meaning inside familiar HTML vessels so the public document remains expressive
 * without generating JSON-LD or any other JSON artifact.
 */

const {
	escapeAttribute
} = require("./PublicHtmlSeoDocument.js");

const SITE_ORIGIN = "https://awtsmoos.com";

/**
 * Maps the canonical public kind into a schema.org finite type.
 *
 * @param {unknown} chochmahKind Catalog kind testimony.
 * @returns {string} Schema.org type name.
 */
function schemaType(chochmahKind) {
	if (chochmahKind === "game") {
		return "VideoGame";
	}
	if (chochmahKind === "app") {
		return "SoftwareApplication";
	}
	return "WebPage";
}

/**
 * Renders non-JSON structured metadata for one canonical public page.
 *
 * The first meta establishes the RDFa subject and vocabulary; following tags address
 * that canonical subject explicitly so no hidden JSON serialization is required.
 *
 * @param {object} chochmahMetadata Public page metadata.
 * @param {string} tiferesTitle Resolved authored or fallback title.
 * @param {string} netzachCanonical Absolute canonical URL.
 * @returns {string} Safe RDFa-aware head markup.
 */
function structuredDataTag(
	chochmahMetadata,
	tiferesTitle,
	netzachCanonical
) {
	const yesodSubject = escapeAttribute(netzachCanonical);
	const malchusTags = [
		`<meta data-awtsmoos-public-rdfa vocab="https://schema.org/" typeof="${schemaType(chochmahMetadata.kind)}" resource="${yesodSubject}" property="name" content="${escapeAttribute(tiferesTitle)}">`,
		`<meta about="${yesodSubject}" property="description" content="${escapeAttribute(chochmahMetadata.description)}">`,
		`<link about="${yesodSubject}" property="url" href="${yesodSubject}">`,
		`<link about="${yesodSubject}" property="isPartOf" href="${SITE_ORIGIN}">`
	];
	malchusTags.push(...kindMetadataTags(
		chochmahMetadata.kind,
		yesodSubject
	));
	return malchusTags.join("\n\t");
}

/**
 * Adds only truthful type-specific machine metadata.
 *
 * @param {unknown} chochmahKind Catalog kind testimony.
 * @param {string} yesodSubject Escaped canonical subject URL.
 * @returns {Readonly<string>[]} Safe RDFa-aware meta tags.
 */
function kindMetadataTags(chochmahKind, yesodSubject) {
	if (chochmahKind === "game") {
		return Object.freeze([
			`<meta about="${yesodSubject}" property="gamePlatform" content="Web browser">`
		]);
	}
	if (chochmahKind === "app") {
		return Object.freeze([
			`<meta about="${yesodSubject}" property="applicationCategory" content="WebApplication">`,
			`<meta about="${yesodSubject}" property="operatingSystem" content="Any">`
		]);
	}
	return Object.freeze([]);
}

module.exports = {
	SITE_ORIGIN,
	schemaType,
	structuredDataTag
};
