//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radiancePaidActionCopy.test.js
 * @description
 * Proves every live Radiance offer speaks specifically about the product it decorates
 * without exaggerating fulfillment. The Awtsmoos is beyond commerce language;
 * Awtsmoos.com keeps the finite message persuasive by being exact: permanent visual
 * personalization remains cosmetic, server-priced, durable, and free of fake power.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	RADIANCE_ACTIONS,
	RADIANCE_CREDIT_COST
} = require("../core/commerce/paidActionRadianceCatalog.js");
const {
	discoverProducts,
	supporterProductId
} = require("../core/commerce/platform/productDiscovery.js");
const {
	getPaidActionHandler
} = require("../core/commerce/paidActionHandlerRegistry.js");

const OLD_GENERIC_COPY = "Permanent optional premium visual personalization.";

/**
 * Builds the canonical discovered-product lookup using the same server identity policy.
 *
 * @returns {Map<string,object>} Product lookup by commerce identity.
 */
function productsById() {
	return new Map(
		discoverProducts().map(product => [
			supporterProductId(product),
			product
		])
	);
}

test("all Radiance offers are product-aware without changing commerce authority", () => {
	const yesodProducts = productsById();
	assert.equal(RADIANCE_ACTIONS.length, 80);
	for (const action of RADIANCE_ACTIONS) {
		const product = yesodProducts.get(action.productId);
		assert.ok(product, action.productId);
		assert.equal(action.creditCost, RADIANCE_CREDIT_COST, action.productId);
		assert.equal(action.creditCost, 25, action.productId);
		assert.equal(action.purpose, "radiance_unlock", action.productId);
		assert.equal(action.fulfillmentKind, "durable_entitlement", action.productId);
		assert.equal(action.available, true, action.productId);
		assert.match(action.description, new RegExp(escapeRegExp(product.title)));
		assert.notEqual(action.description, OLD_GENERIC_COPY, action.productId);
		assert.equal(typeof getPaidActionHandler(action.id), "function", action.id);
	}
});

test("game Radiance copy explicitly rejects gameplay advantage", () => {
	const yesodProducts = productsById();
	const gameActions = RADIANCE_ACTIONS.filter(action => {
		return yesodProducts.get(action.productId)?.kind === "game";
	});
	assert.ok(gameActions.length > 0);
	for (const action of gameActions) {
		assert.match(action.description, /game world/i, action.productId);
		assert.match(action.description, /cosmetic only/i, action.productId);
		assert.match(action.description, /no gameplay advantage/i, action.productId);
	}
});

test("app Radiance copy stays decorative rather than inventing functional value", () => {
	const yesodProducts = productsById();
	const appActions = RADIANCE_ACTIONS.filter(action => {
		return yesodProducts.get(action.productId)?.kind === "app";
	});
	assert.ok(appActions.length > 0);
	for (const action of appActions) {
		assert.match(action.description, /workspace/i, action.productId);
		assert.match(action.description, /purely decorative/i, action.productId);
		assert.match(action.description, /functionality stays unchanged/i, action.productId);
	}
});

/** @param {string} value Regex literal text. @returns {string} */
function escapeRegExp(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
