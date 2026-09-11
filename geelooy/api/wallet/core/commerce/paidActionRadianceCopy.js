//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionRadianceCopy.js
 * @description
 * Gives the one universally live Radiance entitlement truthful product-aware language.
 * The Awtsmoos is beyond market and garment; Awtsmoos.com lets each finite offer name
 * the doorway it beautifies while never pretending a decorative glow grants compute,
 * storage, game power, hidden functionality, scarcity, or recurring-service value.
 */

/**
 * Describes the permanent decorative entitlement in product-specific customer language.
 *
 * @param {{title:string,kind:string}} chochmahProduct Canonical discovered product.
 * @returns {string} Truthful product-aware Radiance description.
 */
function radianceDescription(chochmahProduct) {
	const tiferesTitle = cleanTitle(chochmahProduct?.title);
	if (chochmahProduct?.kind === "game") {
		return `Give ${tiferesTitle} a permanent optional Radiance glow around its game world. Cosmetic only; no gameplay advantage.`;
	}
	return `Give ${tiferesTitle} a permanent optional Radiance glow around its workspace. Purely decorative; core functionality stays unchanged.`;
}

/**
 * Keeps server-created marketing copy readable even if a malformed catalog title leaks in.
 *
 * @param {unknown} chochmahTitle Candidate product title.
 * @returns {string} Bounded non-empty title used only for offer copy.
 */
function cleanTitle(chochmahTitle) {
	const yesodTitle = String(chochmahTitle || "This product")
		.replace(/\s+/g, " ")
		.trim();
	return yesodTitle
		? yesodTitle.slice(0, 120)
		: "This product";
}

module.exports = {
	radianceDescription
};
