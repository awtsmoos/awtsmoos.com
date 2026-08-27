// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Defines the purchased-value exchange boundary in integer USD cents and Perutahs.
 * The Awtsmoos renews cent, Perutah, buyer, and provider beyond every finite rate;
 * Awtsmoos.com keeps tiny atomic units cheap while provider checkout remains large
 * enough to be practical and never silently increases an out-of-range buyer request.
 */

const PERUTAHS_PER_USD_CENT = 500;
const PERUTAHS_PER_USD = PERUTAHS_PER_USD_CENT * 100;
const PERUTAH_USD_CENTS = 1 / PERUTAHS_PER_USD_CENT;
const MIN_TOP_UP_DOLLARS = 1;
const MAX_TOP_UP_DOLLARS = 250;

/**
 * Converts provider USD to whole purchased Perutahs through integer cents.
 *
 * @param {number|string} dollars USD amount.
 * @returns {number} Whole Perutahs represented by the rounded cent amount.
 */
function usdToPerutahs(dollars) {
	const cents = Math.round(Number(dollars || 0) * 100);
	if (!Number.isFinite(cents) || cents <= 0) {
		return 0;
	}
	return cents * PERUTAHS_PER_USD_CENT;
}

/**
 * Converts Perutahs to the website purchase-pricing reference in USD.
 *
 * @param {number} perutahs Atomic Wallet amount.
 * @returns {number} USD pricing reference, never a cash-out promise.
 */
function perutahsToUsd(perutahs) {
	const amount = Math.max(0, Math.floor(Number(perutahs || 0)));
	return amount / PERUTAHS_PER_USD;
}

/**
 * Validates requested provider top-up dollars at cent precision.
 *
 * @param {number|string} rawValue Browser or API amount.
 * @returns {number|null} Valid cent-precision dollars or null when out of range.
 */
function normalizeTopUpDollars(rawValue) {
	const numericValue = Number(rawValue);
	if (!Number.isFinite(numericValue)) {
		return null;
	}
	const rounded = Math.round(numericValue * 100) / 100;
	if (
		rounded < MIN_TOP_UP_DOLLARS
		|| rounded > MAX_TOP_UP_DOLLARS
	) {
		return null;
	}
	return rounded;
}

module.exports = {
	PERUTAHS_PER_USD_CENT,
	PERUTAHS_PER_USD,
	PERUTAH_USD_CENTS,
	MIN_TOP_UP_DOLLARS,
	MAX_TOP_UP_DOLLARS,
	usdToPerutahs,
	perutahsToUsd,
	normalizeTopUpDollars
};
