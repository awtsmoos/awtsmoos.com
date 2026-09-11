// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fsp = require("fs/promises");

const dataDir = path.join(os.tmpdir(), `awtsmoos-product-credits-${process.pid}`);
process.env.AWTSMOOS_WALLET_DATA_DIR = dataDir;

const { defineSku } = require("../core/commerce/sku.js");
const { purchaseSku } = require("../core/commerce/purchaseEngine.js");
const { getCommerceAccount } = require("../core/commerce/access.js");
const { creditOnce, getWallet } = require("../core/store.js");

const CREDIT_SKU = defineSku({
	id: "test-app.credits.spark.001",
	title: "Test App · 50 Credits",
	productId: "test-app",
	kind: "consumable_credit_pack",
	creditUnits: 50,
	creditLabel: "Test App Credits",
	pricePerutahs: 50000,
	spendPolicy: "purchased_only",
	available: true
});

/** Resets isolated durable storage so every economic invariant starts clean. */
test.beforeEach(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test.after(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test("purchased Perutas atomically grant persistent product credits", async () => {
	await topUp("credit-user", 100000, "credit-topup-001");
	const result = await purchaseSku("credit-user", CREDIT_SKU, "credit-buy-001");
	const commerce = await getCommerceAccount("credit-user");
	const wallet = await getWallet("credit-user");
	assert.equal(result.ok, true);
	assert.equal(result.productCredit.balance, 50);
	assert.equal(result.receipt.creditUnits, 50);
	assert.equal(wallet.purchasedBalance, 50000);
	assert.deepEqual(commerce.productCredits[0], {
		productId: "test-app",
		balance: 50,
		lifetimePurchased: 50,
		lifetimeConsumed: 0,
		updatedAt: commerce.productCredits[0].updatedAt
	});
});

test("same purchase operation cannot double grant or double debit", async () => {
	await topUp("retry-user", 100000, "credit-topup-002");
	await purchaseSku("retry-user", CREDIT_SKU, "credit-buy-002");
	const retry = await purchaseSku("retry-user", CREDIT_SKU, "credit-buy-002");
	const commerce = await getCommerceAccount("retry-user");
	assert.equal(retry.ok, true);
	assert.equal(retry.deduplicated, true);
	assert.equal(retry.productCredit.balance, 50);
	assert.equal(commerce.productCredits[0].lifetimePurchased, 50);
	assert.equal((await getWallet("retry-user")).purchasedBalance, 50000);
});

test("consumable pack may be purchased again with a new operation key", async () => {
	await topUp("repeat-user", 150000, "credit-topup-003");
	await purchaseSku("repeat-user", CREDIT_SKU, "credit-buy-003");
	const second = await purchaseSku("repeat-user", CREDIT_SKU, "credit-buy-004");
	assert.equal(second.ok, true);
	assert.equal(second.productCredit.balance, 100);
	assert.equal(second.productCredit.lifetimePurchased, 100);
	assert.equal((await getWallet("repeat-user")).purchasedBalance, 50000);
});

test("promotional Perutas cannot purchase app credits", async () => {
	const result = await purchaseSku("promo-user", CREDIT_SKU, "credit-buy-005");
	assert.equal(result.ok, false);
	assert.equal(result.error, "insufficient_purchased_perutahs");
	assert.deepEqual((await getCommerceAccount("promo-user")).productCredits, []);
});

async function topUp(userId, amount, idempotencyKey) {
	return creditOnce(userId, amount, "verified_topup_test", {
		balanceKind: "purchased",
		idempotencyKey
	});
}
