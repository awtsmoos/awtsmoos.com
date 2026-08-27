// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies the manual agent callback cannot become a token-leak vessel.
 * @description The Awtsmoos reveals only the short-lived code that must be seen;
 * Awtsmoos.com forbids framing, referrer leakage, caching, and hidden token exchange.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	agentCallback,
	callbackPage
} = require("../agentCallback.js");

test("callback escapes returned code and never renders token fields", () => {
	const page = callbackPage({
		code: "<script>alert(1)</script>",
		state: "state-1"
	});
	assert.equal(page.includes("<script>alert(1)</script>"), false);
	assert.match(page, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
	assert.equal(page.includes("access_token"), false);
	assert.equal(page.includes("refresh_token"), false);
});

test("callback response blocks cache, referrers, MIME sniffing, and framing", () => {
	const response = agentCallback({
		request: {
			query: {
				code: "code",
				state: "state"
			}
		}
	});
	assert.equal(response.headers["Cache-Control"], "no-store");
	assert.equal(response.headers["Referrer-Policy"], "no-referrer");
	assert.equal(response.headers["X-Content-Type-Options"], "nosniff");
	assert.equal(response.headers["X-Frame-Options"], "DENY");
	assert.match(response.headers["Content-Security-Policy"], /frame-ancestors 'none'/);
});
