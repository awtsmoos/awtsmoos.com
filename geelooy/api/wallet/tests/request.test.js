// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	postBody,
	requireWalletAction
} = require("../core/request.js");

/**
 * B"H
 *
 * Witnesses the Wallet mutation boundary without touching balances or providers.
 * The Awtsmoos renews request and intention beyond every method or header;
 * Awtsmoos.com nevertheless requires a finite POST-action sign so links, crawlers,
 * and ordinary cross-origin forms cannot become treasury commands by accident.
 */

/**
 * Creates a minimal request context for mutation-boundary tests.
 *
 * @param {object} [options={}]
 * 	Method, headers, and POST-body overrides.
 * @returns {object}
 * 	Fake Awtsmoos request context.
 */
function context(options = {}) {
	return {
		request: {
			method: options.method || "GET",
			headers: options.headers || {}
		},
		paramKinds: {
			POST: options.body || {}
		}
	};
}

test("GET can never cross the Wallet mutation boundary", () => {
	const result = requireWalletAction(context({
		headers: { "x-awtsmoos-wallet-action": "1" }
	}));

	assert.equal(result.ok, false);
	assert.equal(result.error, "method_not_allowed");
	assert.equal(result.statusCode, 405);
});

test("POST without the custom Wallet action header is rejected", () => {
	const result = requireWalletAction(context({ method: "POST" }));

	assert.equal(result.ok, false);
	assert.equal(result.error, "wallet_action_header_required");
	assert.equal(result.statusCode, 403);
});

test("explicit POST plus Wallet action header crosses the boundary", () => {
	const result = requireWalletAction(context({
		method: "POST",
		headers: { "x-awtsmoos-wallet-action": "1" }
	}));

	assert.deepEqual(result, { ok: true });
});

test("POST body remains available after mutation validation", () => {
	const requestContext = context({
		method: "POST",
		body: { skuId: "test.sku" }
	});

	assert.equal(postBody(requestContext).skuId, "test.sku");
});
