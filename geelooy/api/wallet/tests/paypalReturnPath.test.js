// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeReturnPath, providerReturnUrls } = require("../core/paypalReturnPath.js");

test("same-site product return path survives provider travel", () => {
	const result = providerReturnUrls(
		"https://awtsmoos.com",
		"/games/chess/?commerce=1"
	);
	assert.equal(result.returnPath, "/games/chess/?commerce=1");
	assert.equal(result.returnUrl, "https://awtsmoos.com/games/chess/?commerce=1&paypalReturn=1");
	assert.equal(result.cancelUrl, "https://awtsmoos.com/games/chess/?commerce=1&paypalCancel=1");
});

test("external return attempts collapse to Wallet", () => {
	assert.equal(normalizeReturnPath("https://evil.example/steal"), "/apps/wallet/");
	assert.equal(normalizeReturnPath("//evil.example/steal"), "/apps/wallet/");
});

test("stale provider callback fields are stripped before a new order", () => {
	const result = providerReturnUrls(
		"https://awtsmoos.com",
		"/apps/docs/?commerce=1&paypalReturn=1&token=old"
	);
	assert.equal(result.returnUrl.includes("token="), false);
	assert.equal(result.returnUrl.match(/paypalReturn/g)?.length, 1);
});
