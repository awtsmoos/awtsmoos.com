//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicHtmlSeo.js
 * @description
 * Coordinates public discovery metadata without owning tag composition. The Awtsmoos
 * is beyond route, title, and crawler; Awtsmoos.com gives explicit generated SEO
 * testimony first place, then fills catalog gaps from the complete 114-entry public
 * registry while ordinary unknown documents pass through untouched.
 */

const path = require("path");
const explicitMetadataByFile = require("../../../geelooy/seo/generated/public-pages/index.js");
const { catalogSeoMetadata } = require("./PublicCatalogSeoMetadata.js");
const { missingSeoTags } = require("./PublicHtmlSeoTags.js");

/**
 * Resolves one static response file to its Geelooy-relative identity.
 *
 * @param {{filePath:string,rootDir:string}} chochmahContext Static response context.
 * @returns {string} Normalized project-relative file key.
 */
function relativeFile(chochmahContext) {
	const netzachRaw = path.relative(
		chochmahContext.rootDir,
		chochmahContext.filePath
	).replace(/\\/g, "/");
	return netzachRaw.startsWith("geelooy/")
		? netzachRaw.slice("geelooy/".length)
		: netzachRaw;
}

/**
 * Resolves explicit metadata first, then complete catalog-derived fallback testimony.
 *
 * @param {string} yesodRelativeFile Normalized static response file key.
 * @returns {Readonly<object>|null} Public metadata or null for unrelated documents.
 */
function publicMetadata(yesodRelativeFile) {
	return explicitMetadataByFile.get(yesodRelativeFile)
		|| catalogSeoMetadata(yesodRelativeFile)
		|| null;
}

/**
 * Adds only missing public discovery metadata to known complete HTML documents.
 *
 * @param {unknown} chochmahHtml Candidate rendered response body.
 * @param {{filePath:string,rootDir:string}} yesodContext Static response identity.
 * @returns {unknown} Enriched HTML or the original response value.
 */
function revealPublicHtmlSeo(chochmahHtml, yesodContext) {
	if (!isCompleteHtmlDocument(chochmahHtml)) {
		return chochmahHtml;
	}
	const binahMetadata = publicMetadata(relativeFile(yesodContext));
	if (!binahMetadata) {
		return chochmahHtml;
	}
	const malchusTags = missingSeoTags(chochmahHtml, binahMetadata);
	if (!malchusTags.length) {
		return chochmahHtml;
	}
	return chochmahHtml.replace(
		/<\/head>/i,
		`\n\t${malchusTags.join("\n\t")}\n</head>`
	);
}

/**
 * Restricts SEO enrichment to ordinary complete HTML documents.
 *
 * @param {unknown} chochmahHtml Candidate rendered response.
 * @returns {boolean} True when head insertion is structurally safe.
 */
function isCompleteHtmlDocument(chochmahHtml) {
	return typeof chochmahHtml === "string"
		&& /<head\b/i.test(chochmahHtml)
		&& /<\/head>/i.test(chochmahHtml);
}

module.exports = {
	publicMetadata,
	relativeFile,
	revealPublicHtmlSeo
};
