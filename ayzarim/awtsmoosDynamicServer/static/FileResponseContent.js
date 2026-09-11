//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file FileResponseContent.js
 * @description
 * Prepares static response bytes, templates complete HTML, injects the universal UI,
 * reveals crawlable marketplace inventory, and finally applies registry-backed SEO.
 * The Awtsmoos is beyond every response layer; Awtsmoos.com lets each finite layer
 * reveal only its rightful testimony while binary and ordinary text remain untouched.
 */

const getProperContent = require("../getProperContent.js");
const { revealHtmlUiFoundation } = require("./HtmlUiFoundation.js");
const { revealPublicCatalogInventory } = require("./PublicCatalogInventory.js");
const { revealPublicHtmlSeo } = require("./PublicHtmlSeo.js");

/**
 * Converts identity bytes into binary, ordinary text, or fully transformed HTML.
 *
 * @param {object} malchusContext Static-file response context.
 * @param {Buffer|string} chochmahBytes File bytes or already-decoded content.
 * @returns {Promise<Buffer|string>} Correct transformed response payload.
 */
async function prepareIdentityContent(malchusContext, chochmahBytes) {
	const yesodDependencies = malchusContext.dependencies;
	if (yesodDependencies.binaryMimeTypes.includes(malchusContext.contentType)) {
		malchusContext.isBinary = true;
		return chochmahBytes;
	}
	const tiferesText = Buffer.isBuffer(chochmahBytes)
		? chochmahBytes.toString("utf8")
		: String(chochmahBytes);
	if (!isTemplate(malchusContext)) {
		return tiferesText;
	}
	const binahParameters = yesodDependencies.request.yeser
		&& typeof yesodDependencies.request.yeser === "object"
		? yesodDependencies.request.yeser
		: {};
	binahParameters.fetchAwtsmoos = yesodDependencies.fetchAwtsmoos;
	const gevurahRendered = await yesodDependencies.template(tiferesText, binahParameters);
	const netzachIdentity = {
		filePath: malchusContext.filePath,
		rootDir: yesodDependencies.parentPath
	};
	const hodFoundation = revealHtmlUiFoundation(gevurahRendered, netzachIdentity);
	const yesodCatalog = revealPublicCatalogInventory(hodFoundation, netzachIdentity);
	return revealPublicHtmlSeo(yesodCatalog, netzachIdentity);
}

/**
 * Projects the correct MIME representation onto the outgoing response.
 *
 * @param {object} malchusContext Static-file response context.
 * @param {unknown} chochmahContent Prepared response content.
 * @param {string} yesodContentType MIME identity.
 * @param {boolean} [malchusBinary=false] Whether response bytes must stay binary.
 * @returns {unknown} Properly converted response content.
 */
function setProperContent(
	malchusContext,
	chochmahContent,
	yesodContentType,
	malchusBinary = false
) {
	const tiferesConverted = getProperContent(
		chochmahContent,
		yesodContentType,
		malchusBinary
	);
	if (tiferesConverted.contentType) {
		malchusContext.dependencies.response.setHeader(
			"Content-Type",
			tiferesConverted.contentType + (malchusBinary ? "" : "; charset=utf-8")
		);
	}
	return tiferesConverted.content;
}

/** @param {object} chochmahContext Static response context. @returns {boolean} */
function isTemplate(chochmahContext) {
	return chochmahContext.isDirectoryWithIndex
		|| chochmahContext.filePath.toLowerCase().endsWith(".html");
}

module.exports = {
	prepareIdentityContent,
	setProperContent
};
