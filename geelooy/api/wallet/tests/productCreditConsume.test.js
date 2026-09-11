//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditConsume.test.js
 * @description
 * Proves consumable value is durable, concurrent-safe, and priced only by the
 * server action catalog. Browser-supplied product, amount, and purpose testimony
 * is intentionally irrelevant to the debit that reaches the Wallet lock.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fsp = require("fs/promises");

const dataDir = path.join(os.tmpdir(), `awtsmoos-credit-consume-${process.pid}`);
process.env.AWTSMOOS_WALLET_DATA_DIR = dataDir;
process.env.AWTSMOOS_WALLET_TEST_ACTIONS = "1";

const { defineSku } = require("../core/commerce/sku.js");
const { purchaseSku } = require("../core/commerce/purchaseEngine.js");
const { spendProductCredits } = require("../core/commerce/productCreditService.js");
const { getCommerceAccount } = require("../core/commerce/access.js");
const { creditOnce } = require("../core/store.js");

const DOCS_CREDITS = defineSku({
	id: "docs.test.credits.001",
	title: "Docs Test Credits",
	productId: "docs",
	kind: "consumable_credit_pack",
	creditUnits: 50,
	pricePerutahs: 50000,
	spendPolicy: "purchased_only",
	available: true
});

test.beforeEach(async () => fsp.rm(dataDir, { recursive: true, force: true }));
test.after(async () => fsp.rm(dataDir, { recursive: true, force: true }));

test("server action cost wins over browser amount, product, and purpose", async () => {
	await seedCredits("spender");
	const first = await spendProductCredits("spender", action("test.docs.seven", "consume-key-001"));
	const retry = await spendProductCredits("spender", action("test.docs.seven", "consume-key-001"));
	const conflict = await spendProductCredits("spender", action("test.docs.eight", "consume-key-001"));
	const state = (await getCommerceAccount("spender")).productCredits[0];
	assert.equal(first.balance, 43);
	assert.equal(retry.deduplicated, true);
	assert.equal(conflict.error, "idempotency_conflict");
	assert.equal(state.lifetimeConsumed, 7);
});

test("concurrent server-priced actions cannot overdraw product credits", async () => {
	await seedCredits("parallel");
	const results = await Promise.all([
		spendProductCredits("parallel", action("test.docs.thirty", "parallel-key-001")),
		spendProductCredits("parallel", action("test.docs.thirty", "parallel-key-002"))
	]);
	assert.equal(results.filter(result => result.ok).length, 1);
	assert.equal(results.filter(result => result.error === "insufficient_product_credits").length, 1);
});

test("unknown, malformed, and planned paid actions fail closed", async () => {
	assert.equal((await spendProductCredits("x", action("missing.action", "valid-key-001"))).error, "unknown_paid_action");
	assert.equal((await spendProductCredits("x", action("", "valid-key-002"))).error, "invalid_paid_action");
	assert.equal((await spendProductCredits("x", action("transcribe.hosted.minute", "valid-key-003"))).error, "paid_action_unavailable");
});

/** @param {string} actionId Server-known test action. @param {string} idempotencyKey Retry key. @returns {object} Deliberately hostile browser body. */
function action(actionId, idempotencyKey) {
	return { actionId, idempotencyKey, productId: "attacker-choice", amount: 1, purpose: "attacker-choice" };
}

/** @param {string} userId Test account. @returns {Promise<void>} */
async function seedCredits(userId) {
	await creditOnce(userId, 50000, "verified_topup_test", {
		balanceKind: "purchased",
		idempotencyKey: `${userId}-topup`
	});
	await purchaseSku(userId, DOCS_CREDITS, `${userId}-credit-buy`);
}
