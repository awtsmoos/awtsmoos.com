// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	normalizeWalletBuckets,
	creditWalletBucket,
	debitWalletBuckets
} = require("../core/balanceBuckets.js");
const { createWallet, applyDailyRefill } = require("../core/walletModel.js");

/**
 * B"H
 *
 * Witnesses the provenance law beneath the Perutah treasury without touching disk.
 * The Awtsmoos renews purchased value, promotional generosity, and the shared total;
 * Awtsmoos.com proves that migration preserves value, caps never erase paid value,
 * and spending reveals which finite bucket actually moved.
 */

test("legacy undifferentiated balance migrates intact as non-purchased value", () => {
	const wallet = { balance: 1800, cap: 1200 };
	normalizeWalletBuckets(wallet);
	assert.equal(wallet.balance, 1800);
	assert.equal(wallet.promotionalBalance, 1800);
	assert.equal(wallet.purchasedBalance, 0);
});

test("partial migration reconstructs a missing purchased bucket from total", () => {
	const wallet = { balance: 1500, promotionalBalance: 600 };
	normalizeWalletBuckets(wallet);
	assert.equal(wallet.promotionalBalance, 600);
	assert.equal(wallet.purchasedBalance, 900);
	assert.equal(wallet.balance, 1500);
});

test("partial migration reconstructs a missing promotional bucket from total", () => {
	const wallet = { balance: 1500, purchasedBalance: 900 };
	normalizeWalletBuckets(wallet);
	assert.equal(wallet.promotionalBalance, 600);
	assert.equal(wallet.purchasedBalance, 900);
	assert.equal(wallet.balance, 1500);
});

test("fresh Wallet begins entirely promotional", () => {
	const wallet = createWallet("bucket-user", Date.UTC(2026, 7, 7));
	assert.equal(wallet.balance, 600);
	assert.equal(wallet.promotionalBalance, 600);
	assert.equal(wallet.purchasedBalance, 0);
});

test("promotional credit respects the promotional cap", () => {
	const wallet = createWallet("bucket-user");
	wallet.promotionalBalance = 1100;
	wallet.balance = 1100;
	const result = creditWalletBucket(wallet, 300, "promotional");
	assert.equal(result.added, 100);
	assert.equal(wallet.promotionalBalance, 1200);
	assert.equal(wallet.balance, 1200);
});

test("verified purchased credit is not limited by promotional cap", () => {
	const wallet = createWallet("bucket-user");
	wallet.promotionalBalance = 1200;
	wallet.balance = 1200;
	const result = creditWalletBucket(wallet, 5000, "purchased");
	assert.equal(result.added, 5000);
	assert.equal(wallet.purchasedBalance, 5000);
	assert.equal(wallet.balance, 6200);
});

test("daily refill changes promotional value but not purchased value", () => {
	const firstDay = Date.UTC(2026, 7, 7, 12);
	const wallet = createWallet("bucket-user", firstDay);
	creditWalletBucket(wallet, 400, "purchased");
	const refill = applyDailyRefill(wallet, Date.UTC(2026, 7, 8, 12));
	assert.equal(refill.added, 240);
	assert.equal(wallet.promotionalBalance, 840);
	assert.equal(wallet.purchasedBalance, 400);
	assert.equal(wallet.balance, 1240);
});

test("debit consumes promotional value before purchased value", () => {
	const wallet = createWallet("bucket-user");
	creditWalletBucket(wallet, 500, "purchased");
	const result = debitWalletBuckets(wallet, 700);
	assert.deepEqual(result, {
		ok: true,
		promotional: 600,
		purchased: 100,
		needed: 700
	});
	assert.equal(wallet.promotionalBalance, 0);
	assert.equal(wallet.purchasedBalance, 400);
	assert.equal(wallet.balance, 400);
});

test("insufficient debit leaves both buckets untouched", () => {
	const wallet = createWallet("bucket-user");
	creditWalletBucket(wallet, 100, "purchased");
	const result = debitWalletBuckets(wallet, 701);
	assert.equal(result.ok, false);
	assert.equal(wallet.promotionalBalance, 600);
	assert.equal(wallet.purchasedBalance, 100);
	assert.equal(wallet.balance, 700);
});
