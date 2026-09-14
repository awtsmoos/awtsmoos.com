//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module CloudModel
 * @description
 * Converts canonical Wallet testimony into a read-only Awtsmoos Cloud sales model.
 * Presentation may explain an offer, but it never invents price, availability, or ownership.
 */

const FOUNDING_PREFIX = "drive.service.";
const FOUNDING_MARKER = ".reservation.";
const OFFER_COPY = Object.freeze({
	launch: "For a focused business website, launch page, or first production presence.",
	business: "For richer business workflows, forms, data, integrations, and production setup.",
	agency: "For agencies or studios preparing multiple client sites and repeatable delivery."
});

/**
 * Builds the complete renderable Cloud state from server responses.
 * @param {object} data Raw catalog, currency, balance, and entitlement testimony.
 * @returns {Readonly<object>} Normalized Cloud state.
 */
export function buildCloudModel(data = {}) {
	const rate = positiveNumber(data.currency?.pricing?.perutahsPerUsdCent);
	const authenticated = data.balance?.ok === true;
	const purchasedBalance = authenticated
		? nonNegativeNumber(data.balance?.wallet?.purchasedBalance)
		: 0;
	const owned = entitlementKeys(data.entitlements);
	const offers = foundingSkus(data.catalog)
		.map(sku => normalizeOffer(sku, rate, purchasedBalance, owned, authenticated));

	return Object.freeze({
		authenticated,
		offers: Object.freeze(offers),
		purchasedBalance,
		rate
	});
}

/** Extracts only live founder-assisted reservation SKUs from the public catalog. */
function foundingSkus(catalog = {}) {
	const skus = Array.isArray(catalog.skus) ? catalog.skus : [];
	return skus.filter(sku => {
		const id = String(sku?.id || "");
		return sku?.available === true
			&& id.startsWith(FOUNDING_PREFIX)
			&& id.includes(FOUNDING_MARKER);
	});
}

/** Converts one server-priced SKU into display testimony and purchase readiness. */
function normalizeOffer(sku, rate, purchasedBalance, owned, authenticated) {
	const pricePerutahs = nonNegativeNumber(sku.pricePerutahs);
	const code = String(sku.id).split(".")[2] || "launch";
	const dollars = rate > 0 ? pricePerutahs / (rate * 100) : 0;
	const isOwned = owned.has(String(sku.id));
	return Object.freeze({
		authenticated,
		canPurchase: authenticated && !isOwned && purchasedBalance >= pricePerutahs,
		code,
		description: String(sku.description || ""),
		dollars,
		id: String(sku.id),
		needsFunding: authenticated && !isOwned && purchasedBalance < pricePerutahs,
		owned: isOwned,
		pricePerutahs,
		shortDescription: OFFER_COPY[code] || OFFER_COPY.launch,
		title: String(sku.title || "Awtsmoos founding reservation")
	});
}

/** Returns durable entitlement keys without trusting optional non-array testimony. */
function entitlementKeys(response = {}) {
	const entries = Array.isArray(response.entitlements) ? response.entitlements : [];
	return new Set(entries.map(item => String(item?.key || "")).filter(Boolean));
}

/** Normalizes numeric testimony to a finite non-negative amount. */
function nonNegativeNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
}

/** Requires a positive finite conversion rate before displaying dollar equivalents. */
function positiveNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
}

export { foundingSkus, normalizeOffer };
