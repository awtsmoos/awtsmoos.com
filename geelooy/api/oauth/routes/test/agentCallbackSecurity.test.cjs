// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const Handoff = require("../../core/agentHandoffStore.js");
const { agentCallback, callbackPage } = require("../agentCallback.js");

/**
 * @file Verifies automatic callback delivery cannot become a token or code-leak vessel.
 * @description The Awtsmoos returns one short-lived code to its waiting agent while Awtsmoos.com
 * hides delivered secrets from the page and keeps manual display only as an escaped fallback.
 */
test("fallback callback escapes returned code and never renders token fields", () => {
	const page = callbackPage({ code: "<script>alert(1)</script>", state: "state-1" }, { delivered: false });
	assert.equal(page.includes("<script>alert(1)</script>"), false);
	assert.match(page, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
	assert.equal(page.includes("access_token"), false);
	assert.equal(page.includes("refresh_token"), false);
});

test("matching handoff delivers code automatically and hides it from HTML", () => {
	const created = Handoff.create({ scope: "profile", codeChallenge: "C".repeat(43) });
	const response = agentCallback({ request: { query: { code: "code-hidden", state: created.state } } });
	assert.equal(response.statusCode, 200);
	assert.match(response.response, /returned automatically/i);
	assert.equal(response.response.includes("code-hidden"), false);
	const status = Handoff.status(created.handoffId, created.handoffProof);
	assert.equal(status.result.code, "code-hidden");
	Handoff.acknowledge(created.handoffId, created.handoffProof);
});

test("callback response blocks cache, referrers, MIME sniffing, and framing", () => {
	const response = agentCallback({ request: { query: { code: "code", state: "unmatched-state" } } });
	assert.equal(response.headers["Cache-Control"], "no-store");
	assert.equal(response.headers["Referrer-Policy"], "no-referrer");
	assert.equal(response.headers["X-Content-Type-Options"], "nosniff");
	assert.equal(response.headers["X-Frame-Options"], "DENY");
	assert.match(response.headers["Content-Security-Policy"], /frame-ancestors 'none'/);
});
