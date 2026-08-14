// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fsp = require("fs/promises");

const dataDir = path.join(os.tmpdir(), `awtsmoos-commerce-live-${process.pid}`);
process.env.AWTSMOOS_WALLET_DATA_DIR = dataDir;

const { CATALOG, getSku } = require("../core/commerce/catalog.js");
const { purchaseSku } = require("../core/commerce/purchaseEngine.js");
const { getCommerceAccount } = require("../core/commerce/access.js");
const { creditOnce, getWallet } = require("../core/store.js");

/**
 * B"H
 * Proves live monetized goods remain durable, consumed, and purchased-only after
 * the Perutah becomes a genuinely tiny atomic unit. The Awtsmoos renews gift and
 * paid value separately; Awtsmoos.com keeps promotional sparks from becoming revenue.
 */

test.beforeEach(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test.after(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test("production catalog exposes four purchased-only live durable goods", () => {
	const live = CATALOG.filter((sku) => sku.available);
	assert.equal(CATALOG.length, 23);
	assert.deepEqual(live.map((sku) => sku.id), [
		"merkava.commander.sigil.001",
		"wallet.treasury.gold.001",
		"wallet.patron.crown.001",
		"wallet.ledger.seal.001"
	]);
	assert.equal(live.every((sku) => sku.spendPolicy === "purchased_only"), true);
	assert.equal(live.every((sku) => sku.kind === "durable_entitlement"), true);
});

test("promotional refill cannot buy Treasury Gold", async () => {
	const sku = getSku("wallet.treasury.gold.001");
	const result = await purchaseSku("wallet-paid-user", sku, "wallet-paid-001");
	const wallet = await getWallet("wallet-paid-user");
	assert.equal(result.ok, false);
	assert.equal(result.error, "insufficient_purchased_perutahs");
	assert.equal(wallet.promotionalBalance, 600);
	assert.equal(wallet.purchasedBalance, 0);
});

test("promotional refill cannot buy Merkava Commander Sigil", async () => {
	const sku = getSku("merkava.commander.sigil.001");
	const result = await purchaseSku("merkava-paid-user", sku, "merkava-paid-001");
	const wallet = await getWallet("merkava-paid-user");
	assert.equal(result.ok, false);
	assert.equal(result.error, "insufficient_purchased_perutahs");
	assert.equal(wallet.promotionalBalance, 600);
	assert.equal(wallet.purchasedBalance, 0);
});

test("verified purchased Perutahs buy and persist Treasury Gold", async () => {
	await topUp("wallet-paid-user", 10000, "wallet-topup");
	const sku = getSku("wallet.treasury.gold.001");
	const result = await purchaseSku("wallet-paid-user", sku, "wallet-paid-002");
	const wallet = await getWallet("wallet-paid-user");
	assert.equal(result.ok, true);
	assert.equal(wallet.promotionalBalance, 600);
	assert.equal(wallet.purchasedBalance, 3856);
	assert.equal((await getCommerceAccount("wallet-paid-user")).entitlements.some(
		(item) => item.key === sku.entitlementKey
	), true);
});

test("one dollar of purchased Perutahs buys Merkava without touching promotion", async () => {
	await topUp("merkava-paid-user", 50000, "merkava-topup");
	const sku = getSku("merkava.commander.sigil.001");
	const result = await purchaseSku("merkava-paid-user", sku, "merkava-paid-002");
	const wallet = await getWallet("merkava-paid-user");
	assert.equal(result.ok, true);
	assert.equal(wallet.promotionalBalance, 600);
	assert.equal(wallet.purchasedBalance, 11600);
	assert.equal((await getCommerceAccount("merkava-paid-user")).entitlements.some(
		(item) => item.key === sku.entitlementKey
	), true);
});

async function topUp(userId, amount, key) {
	await creditOnce(userId, amount, "verified_topup_test", {
		balanceKind: "purchased",
		idempotencyKey: key
	});
}
