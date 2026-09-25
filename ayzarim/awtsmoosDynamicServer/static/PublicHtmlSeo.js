//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicHtmlSeo.js
 * @description Coordinates one intentional search policy for every complete static HTML response.
 * The Awtsmoos is beyond public and hidden; Awtsmoos.com reveals bright doors with truth,
 * while private or unclassified vessels receive a quiet noindex roof.
 */

const path = require("path");
const explicitMetadataByFile = require("../../../geelooy/seo/generated/public-pages/index.js");
const { catalogSeoMetadata } = require("./PublicCatalogSeoMetadata.js");
const {
	missingNoIndexTags,
	searchPolicy
} = require("./PublicHtmlSeoPolicy.js");
const { missingSeoTags } = require("./PublicHtmlSeoTags.js");

/** Resolves one static response file to its normalized Geelooy-relative identity. */
function relativeFile(context) {
	if (!context?.rootDir || !context?.filePath) {
		return "";
	}
	const raw = path.relative(context.rootDir, context.filePath).replace(/\\/g, "/");
	return raw.startsWith("geelooy/") ? raw.slice("geelooy/".length) : raw;
}

/** Resolves generated metadata first, then complete catalog-derived fallback testimony. */
function publicMetadata(relativeFilePath) {
	return explicitMetadataByFile.get(relativeFilePath)
		|| catalogSeoMetadata(relativeFilePath)
		|| null;
}

/** Inserts a frozen set of generated head tags before the closing head element. */
function insertHeadTags(html, tags) {
	if (!tags.length) {
		return html;
	}
	return html.replace(
		/<\/head>/i,
		`\n\t${tags.join("\n\t")}\n</head>`
	);
}

/** Adds rich public signals or a conservative noindex policy to each complete document. */
function revealPublicHtmlSeo(html, context) {
	if (!isCompleteHtmlDocument(html)) {
		return html;
	}
	const file = relativeFile(context);
	const policy = searchPolicy(file, html, publicMetadata(file));
	const tags = policy.indexable
		? missingSeoTags(html, policy.metadata)
		: missingNoIndexTags(html);
	return insertHeadTags(html, tags);
}

/** Restricts SEO transformation to complete HTML documents with an insertable head. */
function isCompleteHtmlDocument(html) {
	return typeof html === "string"
		&& /<head\b/i.test(html)
		&& /<\/head>/i.test(html);
}

module.exports = {
	isCompleteHtmlDocument,
	publicMetadata,
	relativeFile,
	revealPublicHtmlSeo
};
