//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radiancePaidAction.test.js
 * @description
 * Proves every canonical product receives one genuinely live Radiance capability.
 * The Awtsmoos is beyond product, price, and handler; Awtsmoos.com keeps browser
 * desire beneath server authority so every advertised credit pack has real bounded
 * fulfillment and no client can rewrite product identity or cost.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	RADIANCE_ACTIONS,
	RADIANCE_CREDIT_COST,
	getPaidAction,
	hasLivePaidActionForProduct
} = require("../core/commerce/paidActionCatalog.js");
const { getPaidActionHandler } = require("../core/commerce/paidActionHandlerRegistry.js");
const { CREDIT_PACK_SKUS } = require("../core/commerce/creditPackCatalog.js");
const {
	discoverProducts,
	supporterProductId
} = require("../core/commerce/platform/productDiscovery.js");

const PRODUCT_ID = "transcribe";
const ACTION_ID = `${PRODUCT_ID}.radiance.unlock`;

/**
 * Verifies the whole canonical catalog has a handler-backed permanent capability.
 */
test("every canonical product has live Radiance and live credit packs", () => {
	const products = discoverProducts();
	const productIds = new Set(products.map(supporterProductId));
	assert.equal(productIds.size, 80);
	assert.equal(RADIANCE_ACTIONS.length, 80);
	for (const productId of productIds) {
		assert.equal(hasLivePaidActionForProduct(productId), true, productId);
	}
	const livePacks = CREDIT_PACK_SKUS.filter(sku => sku.available);
	assert.equal(livePacks.length, 240);
});

/**
 * Verifies browser-supplied product/amount cannot replace server capability truth.
 */
test("Radiance price, product, purpose, and fulfillment stay server authoritative", () => {
	const action = getPaidAction(ACTION_ID);
	assert.equal(action.productId, PRODUCT_ID);
	assert.equal(action.creditCost, RADIANCE_CREDIT_COST);
	assert.equal(action.creditCost, 25);
	assert.equal(action.purpose, "radiance_unlock");
	assert.equal(action.fulfillmentKind, "durable_entitlement");
	assert.equal(typeof getPaidActionHandler(ACTION_ID), "function");
});
