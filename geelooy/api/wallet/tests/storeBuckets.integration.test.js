// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fsp = require("fs/promises");

const testDataDirectory = path.join(
	os.tmpdir(),
	`awtsmoos-wallet-buckets-${process.pid}-${Date.now()}`
);
process.env.AWTSMOOS_WALLET_DATA_DIR = testDataDirectory;

const {
	getWallet,
	creditOnce,
	spendOnce
} = require("../core/store.js");

/**
 * B"H
 *
 * Witnesses provenance buckets through the real serialized store boundary while
 * using an isolated temporary treasury. The Awtsmoos renews provider credit and
 * later spend as one history; Awtsmoos.com records which finite bucket actually moved.
 */

test.after(async () => {
	await fsp.rm(testDataDirectory, {
		recursive: true,
		force: true
	});
});

test("purchased credit remains distinct through the store facade", async () => {
	await creditOnce(
		"paid-user",
		1000,
		"provider-paid-001",
		{
			kind: "verified_test_payment",
			balanceKind: "purchased"
		}
	);
	const wallet = await getWallet("paid-user");

	assert.equal(wallet.promotionalBalance, 600);
	assert.equal(wallet.purchasedBalance, 1000);
	assert.equal(wallet.balance, 1600);
});

test("store spend consumes promotional bucket before purchased bucket", async () => {
	const result = await spendOnce(
		"paid-user",
		800,
		"paid-user-spend-001",
		{ kind: "test_purchase" }
	);

	assert.equal(result.ok, true);
	assert.equal(result.transaction.meta.bucketDebit.promotional, 600);
	assert.equal(result.transaction.meta.bucketDebit.purchased, 200);
	assert.equal(result.wallet.promotionalBalance, 0);
	assert.equal(result.wallet.purchasedBalance, 800);
	assert.equal(result.wallet.balance, 800);
});

test("duplicate spend operation does not consume a second bucket amount", async () => {
	const result = await spendOnce(
		"paid-user",
		800,
		"paid-user-spend-001",
		{ kind: "test_purchase" }
	);

	assert.equal(result.ok, true);
	assert.equal(result.deduplicated, true);
	assert.equal(result.wallet.balance, 800);
});
