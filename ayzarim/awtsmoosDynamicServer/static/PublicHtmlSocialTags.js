//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicHtmlSocialTags.js
 * @description
 * Adds only missing social discovery metadata while preserving authored page values.
 * The Awtsmoos is beyond every reflected image and social graph; Awtsmoos.com lets
 * each finite OpenGraph or Twitter field mirror truthful canonical page testimony
 * without overriding the voice already written by the product itself.
 */

const {
	escapeAttribute,
	hasNamedMeta,
	hasPropertyMeta
} = require("./PublicHtmlSeoDocument.js");

/**
 * Appends missing OpenGraph and Twitter tags to one mutable output collection.
 *
 * @param {string[]} malchusTags Mutable output tag collection.
 * @param {string} chochmahHtml Authored complete HTML document.
 * @param {object} binahMetadata Public metadata testimony.
 * @param {string} tiferesTitle Resolved human-facing page title.
 * @param {string} netzachCanonical Absolute canonical URL.
 * @returns {void}
 */
function pushSocialTags(
	malchusTags,
	chochmahHtml,
	binahMetadata,
	tiferesTitle,
	netzachCanonical
) {
	pushPropertyTags(
		malchusTags,
		chochmahHtml,
		new Map([
			["og:title", tiferesTitle],
			["og:description", binahMetadata.description],
			["og:url", netzachCanonical],
			["og:type", "website"],
			["og:site_name", "Awtsmoos"]
		])
	);
	pushNamedTags(
		malchusTags,
		chochmahHtml,
		new Map([
			["twitter:card", "summary"],
			["twitter:title", tiferesTitle],
			["twitter:description", binahMetadata.description]
		])
	);
}

/**
 * Adds absent property-based metadata from a finite allowlisted map.
 *
 * @param {string[]} malchusTags Mutable output tag collection.
 * @param {string} chochmahHtml Authored HTML.
 * @param {Map<string,string>} yesodProperties Property/value testimony.
 * @returns {void}
 */
function pushPropertyTags(malchusTags, chochmahHtml, yesodProperties) {
	for (const [property, value] of yesodProperties) {
		if (hasPropertyMeta(chochmahHtml, property)) {
			continue;
		}
		malchusTags.push(
			`<meta property="${property}" content="${escapeAttribute(value)}">`
		);
	}
}

/**
 * Adds absent name-based metadata from a finite allowlisted map.
 *
 * @param {string[]} malchusTags Mutable output tag collection.
 * @param {string} chochmahHtml Authored HTML.
 * @param {Map<string,string>} yesodNames Name/value testimony.
 * @returns {void}
 */
function pushNamedTags(malchusTags, chochmahHtml, yesodNames) {
	for (const [name, value] of yesodNames) {
		if (hasNamedMeta(chochmahHtml, name)) {
			continue;
		}
		malchusTags.push(
			`<meta name="${name}" content="${escapeAttribute(value)}">`
		);
	}
}

module.exports = {
	pushSocialTags
};
