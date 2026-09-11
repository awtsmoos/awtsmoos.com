//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module MarketplacePolicy
 * @description Normalizes bounded marketplace input while keeping the platform fee
 * and purchase economics server-authored. Marketplace Perutas remain closed-loop.
 */

const MARKETPLACE_FEE_BPS = 1500;

function listingTitle(value) {
	return bounded(value, 3, 100, "invalid_marketplace_title");
}

function listingDescription(value) {
	return bounded(value, 3, 1000, "invalid_marketplace_description");
}

function deliveryRef(value) {
	return bounded(value, 3, 240, "invalid_marketplace_delivery_ref");
}

function listingPrice(value) {
	const amount = Number(value);
	if (!Number.isInteger(amount) || amount < 100 || amount > 5000000000) {
		throw marketError("invalid_marketplace_price");
	}
	return amount;
}
function listingId(value) {
	return bounded(value, 3, 120, "invalid_marketplace_listing_id");
}

function retryKey(value) {
	return bounded(value, 8, 160, "invalid_idempotency_key");
}

function feeSplit(pricePerutahs) {
	const feePerutahs = Math.floor(pricePerutahs * MARKETPLACE_FEE_BPS / 10000);
	return Object.freeze({
		feePerutahs,
		sellerPerutahs: pricePerutahs - feePerutahs
	});
}

function bounded(value, minimum, maximum, code) {
	const text = String(value || "").trim().replace(/\s+/g, " ");
	if (text.length < minimum || text.length > maximum || text.includes("\0")) {
		throw marketError(code);
	}
	return text;
}

function marketError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = {
	MARKETPLACE_FEE_BPS,
	deliveryRef,
	feeSplit,
	listingDescription,
	listingId,
	listingPrice,
	listingTitle,
	retryKey
};
