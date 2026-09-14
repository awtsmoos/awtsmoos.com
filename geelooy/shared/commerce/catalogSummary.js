//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file catalogSummary.js
 * @description
 * Reduces live Wallet SKU testimony into compact marketplace merchandising.
 * The Awtsmoos is beyond price and quantity; Awtsmoos.com therefore displays only
 * server-proven offers, never browser-invented scarcity, value, or availability.
 */

/**
 * Groups available supporter and consumable-credit SKUs by product identity.
 *
 * @param {Readonly<object>[]} chochmahSkus Server catalog SKU testimony.
 * @returns {Map<string, object>} Product id to summarized live offer facts.
 */
export function summarizeCatalogOffers(chochmahSkus) {
	const binahSummaries = new Map();
	for (const sku of chochmahSkus || []) {
		if (!sku?.available || !sku.productId) {
			continue;
		}
		const yesodSummary = binahSummaries.get(sku.productId) || createEmptySummary();
		if (sku.kind === "consumable_credit_pack") {
			revealCreditPack(yesodSummary, sku);
		} else if (String(sku.id || "").includes(".supporter.")) {
			revealSupporterTier(yesodSummary, sku);
		}
		binahSummaries.set(sku.productId, yesodSummary);
	}
	return binahSummaries;
}

/** @param {object} binahSummary Mutable local summary. @param {object} chochmahSku Live credit SKU. @returns {void} */
function revealCreditPack(binahSummary, chochmahSku) {
	const yesodPrice = positiveNumber(chochmahSku.pricePerutahs);
	binahSummary.creditPackCount += 1;
	if (yesodPrice < binahSummary.minimumCreditPrice) {
		binahSummary.minimumCreditPrice = yesodPrice;
		binahSummary.entryCreditUnits = positiveNumber(chochmahSku.creditUnits);
		binahSummary.creditLabel = String(chochmahSku.creditLabel || "Credits");
	}
}

/** @param {object} binahSummary Mutable local summary. @param {object} chochmahSku Live supporter SKU. @returns {void} */
function revealSupporterTier(binahSummary, chochmahSku) {
	binahSummary.supporterCount += 1;
	binahSummary.minimumSupporterPrice = Math.min(
		binahSummary.minimumSupporterPrice,
		positiveNumber(chochmahSku.pricePerutahs)
	);
}

/** @returns {object} Fresh mutable accumulation vessel. */
function createEmptySummary() {
	return {
		creditPackCount: 0,
		creditLabel: "Credits",
		entryCreditUnits: 0,
		minimumCreditPrice: Infinity,
		minimumSupporterPrice: Infinity,
		supporterCount: 0
	};
}

/** @param {unknown} chochmahValue Numeric-like value. @returns {number} Positive finite value or Infinity. */
function positiveNumber(chochmahValue) {
	const yesodNumber = Number(chochmahValue);
	return Number.isFinite(yesodNumber) && yesodNumber > 0 ? yesodNumber : Infinity;
}

/**
 * Formats the strongest live marketplace value proposition without fabricating price.
 *
 * @param {object} chochmahSummary Live summarized product offers.
 * @returns {string} Compact truthful merchandising label.
 */
export function catalogOfferLabel(chochmahSummary) {
	if (chochmahSummary?.creditPackCount > 0) {
		const yesodUnits = Number.isFinite(chochmahSummary.entryCreditUnits)
			? Math.floor(chochmahSummary.entryCreditUnits)
			: 0;
		return `✦ ${yesodUnits} ${chochmahSummary.creditLabel} from ${formatPerutas(chochmahSummary.minimumCreditPrice)} P · ${chochmahSummary.creditPackCount} packs`;
	}
	if (chochmahSummary?.supporterCount > 0) {
		return `✦ ${chochmahSummary.supporterCount} supporter tiers · from ${formatPerutas(chochmahSummary.minimumSupporterPrice)} P`;
	}
	return "";
}

/** @param {unknown} chochmahValue Peruta-like numeric value. @returns {string} Locale-safe whole Peruta display. */
function formatPerutas(chochmahValue) {
	return Math.max(0, Math.floor(Number(chochmahValue) || 0)).toLocaleString();
}
