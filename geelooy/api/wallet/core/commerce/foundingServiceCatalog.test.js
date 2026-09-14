//B"H
//Boruch Hashem
//Blessed be He

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	MAX_TOP_UP_DOLLARS,
	usdToPerutahs
} = require("../currency.js");
const { CATALOG } = require("./catalog.js");
const {
	FOUNDING_SERVICE_DEFINITIONS,
	FOUNDING_SERVICE_SKUS
} = require("./foundingServiceCatalog.js");

/**
 * @file Founding Service Catalog Tests
 * @description
 * Proves every immediate service reservation is truthful, purchasable in one current
 * Wallet top-up, purchased-only, durable, and uniquely represented in commerce truth.
 */

test("founding build reservations fit one verified Wallet top-up", () => {
	assert.equal(FOUNDING_SERVICE_SKUS.length, 3);
	for (const [index, sku] of FOUNDING_SERVICE_SKUS.entries()) {
		const definition = FOUNDING_SERVICE_DEFINITIONS[index];
		assert.equal(sku.pricePerutahs, usdToPerutahs(definition.dollars));
		assert.ok(definition.dollars <= MAX_TOP_UP_DOLLARS);
		assert.equal(sku.available, true);
		assert.equal(sku.kind, "durable_entitlement");
		assert.equal(sku.productId, "drive");
		assert.equal(sku.spendPolicy, "purchased_only");
	}
});

test("founding reservations remain unique inside the complete catalog", () => {
	const foundingIds = FOUNDING_SERVICE_SKUS.map(sku => sku.id);
	assert.equal(new Set(foundingIds).size, foundingIds.length);
	const catalogIds = CATALOG.map(sku => sku.id);
	assert.equal(new Set(catalogIds).size, catalogIds.length);
	for (const skuId of foundingIds) {
		assert.equal(catalogIds.filter(id => id === skuId).length, 1);
	}
});

test("founding descriptions do not pretend unfinished recurring hosting exists", () => {
	for (const sku of FOUNDING_SERVICE_SKUS) {
		assert.match(sku.description, /one-time/i);
		assert.match(sku.description, /separately confirmed/i);
		assert.doesNotMatch(sku.description, /unlimited|guaranteed|subscription included/i);
	}
});