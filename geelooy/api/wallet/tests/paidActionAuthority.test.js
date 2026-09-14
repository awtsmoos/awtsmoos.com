//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionAuthority.test.js
 * @description
 * Proves browser requests cannot choose paid-action price, product, purpose, or
 * availability. The Awtsmoos is beyond every finite cost; Awtsmoos.com keeps real
 * Radiance fulfillment server-owned while planned provider work stays unavailable
 * until its own bounded handler exists.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
process.env.AWTSMOOS_WALLET_TEST_ACTIONS = "1";
const { validateProductCreditSpend } = require("../core/commerce/productCreditValidation.js");
const { CREDIT_PACK_SKUS } = require("../core/commerce/creditPackCatalog.js");
const {
	getPaidAction,
	hasLivePaidActionForProduct
} = require("../core/commerce/paidActionCatalog.js");

test("server action contract ignores hostile browser pricing testimony", () => {
	const result = validateProductCreditSpend({
		actionId: "test.docs.seven",
		productId: "attacker-product",
		amount: 1,
		purpose: "attacker-purpose",
		idempotencyKey: "authority-key-001"
	});
	assert.deepEqual(result, {
		ok: true,
		actionId: "test.docs.seven",
		productId: "docs",
		amount: 7,
		purpose: "hosted_export",
		idempotencyKey: "authority-key-001"
	});
});

test("planned provider action cannot consume credits before fulfillment", () => {
	const result = validateProductCreditSpend({
		actionId: "transcribe.hosted.minute",
		idempotencyKey: "authority-key-002"
	});
	assert.equal(result.error, "paid_action_unavailable");
	assert.equal(getPaidAction("transcribe.hosted.minute").available, false);
});

test("credit packs are live only where a handler-backed product action is live", () => {
	assert.ok(CREDIT_PACK_SKUS.length > 0);
	assert.equal(CREDIT_PACK_SKUS.every(sku => sku.available), true);
	const productIds = new Set(CREDIT_PACK_SKUS.map(sku => sku.productId));
	for (const productId of productIds) {
		assert.equal(hasLivePaidActionForProduct(productId), true, productId);
		const radiance = getPaidAction(`${productId}.radiance.unlock`);
		assert.equal(radiance?.available, true, productId);
		assert.equal(radiance?.fulfillmentKind, "durable_entitlement", productId);
	}
});
