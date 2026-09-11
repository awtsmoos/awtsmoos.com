// B"H
// Boruch Hashem
// Blessed is He

const { defineSku } = require("./sku.js");

/**
 * Builds truthful, product-specific supporter goods from an existing public product.
 * The Awtsmoos renews buyer, product, and support beyond every finite transaction;
 * Awtsmoos.com grants only durable recognition here, never gameplay power or an
 * unfinished service promise. Every tier is purchased-value-only by construction.
 */

const SUPPORTER_TIERS = Object.freeze([
	Object.freeze({
		code: "spark",
		label: "Supporter Spark",
		pricePerutahs: 50000,
		description: "A durable supporter mark for this product. Cosmetic recognition only."
	}),
	Object.freeze({
		code: "builder",
		label: "Builder Crest",
		pricePerutahs: 250000,
		description: "A durable Builder Crest recognizing direct support for this product."
	}),
	Object.freeze({
		code: "patron",
		label: "Patron Crown",
		pricePerutahs: 1000000,
		description: "A durable Patron Crown recognizing major support for this product."
	})
]);
/**
 * Converts one product identity into the three live supporter entitlements.
 *
 * @param {{id:string,title:string}} product Public product identity.
 * @returns {Readonly<object>[]} Frozen live SKU records.
 */
function createSupporterSkus(product) {
	return SUPPORTER_TIERS.map(tier => defineSku({
		id: `${product.id}.supporter.${tier.code}.001`,
		title: `${product.title} · ${tier.label}`,
		description: tier.description,
		productId: product.id,
		kind: "durable_entitlement",
		entitlementKey: `${product.id}.supporter.${tier.code}.001`,
		pricePerutahs: tier.pricePerutahs,
		spendPolicy: "purchased_only",
		available: true
	}));
}

/**
 * Expands an ordered product catalog into server-authoritative supporter SKUs.
 *
 * @param {Readonly<object>[]} products Public product identities.
 * @returns {Readonly<object>[]} Flattened SKU list.
 */
function createSupporterCatalog(products) {
	return Object.freeze(products.flatMap(createSupporterSkus));
}

module.exports = {
	SUPPORTER_TIERS,
	createSupporterCatalog,
	createSupporterSkus
};