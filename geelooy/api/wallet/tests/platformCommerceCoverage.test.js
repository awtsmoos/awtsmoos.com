//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file platformCommerceCoverage.test.js
 * @description
 * Proves every deployed product receives durable supporter monetization while
 * consumable packs remain planned until a real server-owned paid-action adapter
 * exists. The catalog may grow without weakening those commercial invariants.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { SUPPORTER_PRODUCTS, SUPPORTER_SKUS } = require("../core/commerce/supporterCatalog.js");
const { CREDIT_PACK_SKUS } = require("../core/commerce/creditPackCatalog.js");
const { hasLivePaidActionForProduct } = require("../core/commerce/paidActionCatalog.js");
const { discoverProducts, supporterProductId } = require("../core/commerce/platform/productDiscovery.js");

test("every discovered product has three live purchased-only supporter tiers", () => {
	const products = discoverProducts();
	const supporterIds = new Set(SUPPORTER_PRODUCTS.map(product => product.id));
	assert.ok(products.length >= 60);
	for (const product of products) {
		const id = supporterProductId(product);
		assert.ok(supporterIds.has(id), `missing supporter product for ${product.route}`);
		const skus = SUPPORTER_SKUS.filter(sku => sku.productId === id);
		assert.equal(skus.length, 3, `expected three supporter tiers for ${id}`);
		assert.equal(skus.every(sku => sku.available), true);
		assert.equal(skus.every(sku => sku.kind === "durable_entitlement"), true);
		assert.equal(skus.every(sku => sku.spendPolicy === "purchased_only"), true);
	}
});

test("credit packs exist as roadmap but go live only behind fulfillment", () => {
	for (const product of discoverProducts()) {
		const id = supporterProductId(product);
		const skus = CREDIT_PACK_SKUS.filter(sku => sku.productId === id);
		assert.equal(skus.length, 3, `expected three credit packs for ${id}`);
		assert.equal(skus.every(sku => sku.kind === "consumable_credit_pack"), true);
		assert.equal(skus.every(sku => sku.spendPolicy === "purchased_only"), true);
		assert.equal(skus.every(sku => sku.creditUnits > 0), true);
		assert.equal(skus.every(sku => sku.available), hasLivePaidActionForProduct(id));
	}
});

test("discovered routes and supporter SKU identities stay unique", () => {
	const products = discoverProducts();
	assert.equal(new Set(products.map(product => product.route)).size, products.length);
	assert.equal(new Set(SUPPORTER_SKUS.map(sku => sku.id)).size, SUPPORTER_SKUS.length);
});
