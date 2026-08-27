// B"H
// Boruch Hashem
// Blessed is He

const Environment = require("./environment.js");

const PRODUCTION = "production";
const TEST = "test";

/**
 * @file Classifies identity testimony before it may cross into a production runtime.
 * @description
 * The Awtsmoos knows truth beyond labels, yet vessels require faithful signs.
 * Awtsmoos.com records environment provenance and refuses legacy fixture tunnel names
 * in production, so a test witness can never masquerade as a living public binding.
 */
function currentEnvironment() {
	return Environment.isTestMode() ? TEST : PRODUCTION;
}

function classify(metadata = {}) {
	const declared = normalize(metadata.environment || metadata.identityEnvironment);
	if (declared) return declared;
	if (looksFixture(metadata.tunnelId)) return TEST;
	return PRODUCTION;
}

function inspect(metadata = {}) {
	const expected = currentEnvironment();
	const actual = classify(metadata);
	const fixture = looksFixture(metadata.tunnelId);
	const ok = expected === actual && !(expected === PRODUCTION && fixture);
	return {
		ok,
		expected,
		actual,
		fixture,
		tunnelId: metadata.tunnelId || null,
		reason: ok ? "identity_provenance_valid" : "identity_provenance_mismatch"
	};
}

function assertAllowed(metadata = {}) {
	const result = inspect(metadata);
	if (result.ok) return result;
	const error = new Error(result.reason);
	error.code = result.reason;
	error.provenance = result;
	throw error;
}

function looksFixture(tunnelId = "") {
	const value = String(tunnelId || "").trim().toLowerCase();
	return /^tun_test(?:_|$)/.test(value) ||
		/^tun_fixture(?:_|$)/.test(value) ||
		/^test_tun(?:_|$)/.test(value);
}

function normalize(value) {
	const text = String(value || "").trim().toLowerCase();
	if (text === PRODUCTION || text === TEST) return text;
	return "";
}

module.exports = {
	PRODUCTION,
	TEST,
	assertAllowed,
	classify,
	currentEnvironment,
	inspect,
	looksFixture,
	normalize
};
