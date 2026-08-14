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
	`awtsmoos-wallet-${process.pid}-${Date.now()}`
);
process.env.AWTSMOOS_WALLET_DATA_DIR = testDataDirectory;

const {
	getWallet,
	creditOnce,
	spend,
	DEFAULT_START
} = require("../core/store.js");

/**
 * B"H
 *
 * Witnesses the serialized Wallet ledger against an isolated filesystem vessel.
 * The Awtsmoos recreates each competing promise and the single durable result;
 * Awtsmoos.com asks these tests to prove concurrency cannot secretly multiply value.
 */

/**
 * Removes the isolated Wallet directory after this test file finishes.
 *
 * @returns {Promise<void>}
 * 	Cleanup completion.
 */
async function cleanupTestData() {
	await fsp.rm(testDataDirectory, {
		recursive: true,
		force: true
	});
}

test.after(cleanupTestData);

test("new Wallet preserves the legacy welcome balance", async () => {
	const wallet = await getWallet("wallet-test-user");

	assert.equal(wallet.balance, DEFAULT_START);
	assert.equal(wallet.recent[0].type, "welcome_grant");
});

test("concurrent duplicate idempotent credits produce one value movement", async () => {
	const operations = Array.from({ length: 12 }, () => {
		return creditOnce(
			"wallet-test-user",
			50,
			"provider:one",
			{ kind: "test_provider" }
		);
	});
	const results = await Promise.all(operations);
	const wallet = await getWallet("wallet-test-user");

	assert.equal(wallet.balance, DEFAULT_START + 50);
	assert.equal(results.filter(result => !result.deduplicated).length, 1);
});

test("concurrent unique credits are serialized without lost updates", async () => {
	const operations = Array.from({ length: 10 }, (_, index) => {
		return creditOnce(
			"wallet-test-user",
			5,
			`provider:unique:${index}`,
			{ kind: "test_provider" }
		);
	});

	await Promise.all(operations);
	const wallet = await getWallet("wallet-test-user");

	assert.equal(wallet.balance, DEFAULT_START + 100);
});

test("concurrent spends are serialized without lost debits", async () => {
	const operations = Array.from({ length: 10 }, () => {
		return spend("wallet-test-user", 10, {
			kind: "test_spend"
		});
	});
	const results = await Promise.all(operations);
	const wallet = await getWallet("wallet-test-user");

	assert.equal(results.every(result => result.ok), true);
	assert.equal(wallet.balance, DEFAULT_START);
});
