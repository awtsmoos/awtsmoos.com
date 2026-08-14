// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	SANDBOX_BASE,
	LIVE_BASE,
	getPayPalConfig
} = require("../core/paypalEnvironment.js");

/**
 * B"H
 *
 * Witnesses that PayPal configuration fails closed in production instead of
 * silently using a sandbox provider. The Awtsmoos renews environment and provider
 * beyond every variable; Awtsmoos.com demands an explicit finite live vessel before
 * real money may enter the Perutah treasury.
 */

const originalEnvironment = { ...process.env };

test.afterEach(() => {
	for (const key of Object.keys(process.env)) {
		if (!(key in originalEnvironment)) {
			delete process.env[key];
		}
	}

	Object.assign(process.env, originalEnvironment);
});

test("development defaults to sandbox when secret is provided", () => {
	process.env.NODE_ENV = "development";
	process.env.PAYPAL_CLIENT_SECRET = "test-secret";
	delete process.env.PAYPAL_BASE;
	delete process.env.PAYPAL_CLIENT_ID;

	const config = getPayPalConfig();

	assert.equal(config.base, SANDBOX_BASE);
	assert.equal(config.secret, "test-secret");
	assert.ok(config.clientId);
});

test("production refuses missing explicit provider base", () => {
	process.env.NODE_ENV = "production";
	process.env.PAYPAL_CLIENT_ID = "live-client";
	process.env.PAYPAL_CLIENT_SECRET = "live-secret";
	delete process.env.PAYPAL_BASE;

	assert.throws(
		() => getPayPalConfig(),
		/paypal_base_required_in_production/
	);
});

test("production refuses sandbox provider base", () => {
	process.env.NODE_ENV = "production";
	process.env.PAYPAL_CLIENT_ID = "live-client";
	process.env.PAYPAL_CLIENT_SECRET = "live-secret";
	process.env.PAYPAL_BASE = SANDBOX_BASE;

	assert.throws(
		() => getPayPalConfig(),
		/paypal_live_base_required_in_production/
	);
});

test("production accepts explicit live provider configuration", () => {
	process.env.NODE_ENV = "production";
	process.env.PAYPAL_CLIENT_ID = "live-client";
	process.env.PAYPAL_CLIENT_SECRET = "live-secret";
	process.env.PAYPAL_BASE = LIVE_BASE;

	const config = getPayPalConfig();

	assert.equal(config.base, LIVE_BASE);
	assert.equal(config.clientId, "live-client");
	assert.equal(config.secret, "live-secret");
});
