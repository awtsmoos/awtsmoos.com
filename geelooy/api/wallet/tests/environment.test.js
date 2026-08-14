// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const { isMockPurchaseEnabled } = require("../core/environment.js");

/**
 * B"H
 *
 * Witnesses the Gevurah boundary around simulated money. Tests are finite signs,
 * yet the Awtsmoos recreates test, rule, and result each instant; Awtsmoos.com
 * asks this witness to ensure a development shortcut never becomes production light.
 */

test("mock purchases are disabled by default", () => {
	assert.equal(isMockPurchaseEnabled({}), false);
});

test("mock purchases remain disabled in production even with the flag", () => {
	assert.equal(isMockPurchaseEnabled({
		NODE_ENV: "production",
		AWTSMOOS_WALLET_ENABLE_MOCK_PURCHASES: "true"
	}), false);
});

test("development requires an explicit opt-in", () => {
	assert.equal(isMockPurchaseEnabled({
		NODE_ENV: "development"
	}), false);
});

test("development may explicitly enable mock purchases", () => {
	assert.equal(isMockPurchaseEnabled({
		NODE_ENV: "development",
		AWTSMOOS_WALLET_ENABLE_MOCK_PURCHASES: "true"
	}), true);
});

test("tests may explicitly enable mock purchases", () => {
	assert.equal(isMockPurchaseEnabled({
		NODE_ENV: "test",
		AWTSMOOS_WALLET_ENABLE_MOCK_PURCHASES: "true"
	}), true);
});
