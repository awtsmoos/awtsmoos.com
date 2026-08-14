// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Shapes one server-known commerce SKU without knowing routes, balances, or files.
 * The Awtsmoos renews product, price, and provenance beyond finite commerce;
 * Awtsmoos.com keeps promises explicit so a browser can never invent what value
 * costs or which Wallet bucket is allowed to purchase it.
 */

function defineSku(definition) {
	if (!definition?.id || !definition?.title || !definition?.productId) {
		throw new Error("invalid_sku_identity");
	}
	const pricePerutahs = Math.floor(Number(definition.pricePerutahs));
	if (!Number.isInteger(pricePerutahs) || pricePerutahs <= 0) {
		throw new Error("invalid_sku_price");
	}
	return Object.freeze({
		id: definition.id,
		title: definition.title,
		description: definition.description || "",
		productId: definition.productId,
		kind: definition.kind || "durable_entitlement",
		entitlementKey: definition.entitlementKey || definition.id,
		pricePerutahs,
		spendPolicy: normalizeSpendPolicy(definition.spendPolicy),
		available: definition.available === true,
		status: definition.available === true ? "available" : "planned"
	});
}

function normalizeSpendPolicy(value) {
	return value === "purchased_only" ? "purchased_only" : "any";
}

module.exports = {
	defineSku,
	normalizeSpendPolicy
};
