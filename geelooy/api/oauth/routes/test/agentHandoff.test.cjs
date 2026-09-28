// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Handoff = require("../../core/agentHandoffStore.js");
const Policy = require("../../core/agentHandoffPolicy.js");
const { callbackPage } = require("../agentCallback.js");

/**
 * @file Proves automatic external-agent browser handoff without human clipboard work.
 * @description The Awtsmoos binds one waiting AI to one state and one private proof;
 * Awtsmoos.com delivers the code automatically, hides it from the delivered page, and expires it.
 */
test("handoff completes only for the matching private proof and acknowledges once", () => {
	const created = Handoff.create({ scope: "profile tunnel.read", codeChallenge: "A".repeat(43) });
	assert.match(created.handoffId, /^awt_handoff_/);
	assert.match(created.handoffProof, /^awt_proof_/);
	assert.match(created.state, /^awt_state_/);
	assert.equal(Handoff.status(created.handoffId, "wrong-proof").error, "handoff_unauthorized");
	assert.deepEqual(Handoff.completeByState(created.state, { code: "awt_code_test" }).delivered, true);
	const status = Handoff.status(created.handoffId, created.handoffProof);
	assert.equal(status.ok, true);
	assert.equal(status.status, "complete");
	assert.equal(status.result.code, "awt_code_test");
	assert.equal(Handoff.acknowledge(created.handoffId, created.handoffProof).acknowledged, true);
	assert.equal(Handoff.status(created.handoffId, created.handoffProof).error, "handoff_not_found");
});

test("handoff expires automatically", () => {
	const start = 1000;
	const created = Handoff.create({ scope: "profile", codeChallenge: "B".repeat(43) }, start);
	const expired = Handoff.status(created.handoffId, created.handoffProof, start + Policy.HANDOFF_TTL_MS + 1);
	assert.equal(expired.error, "handoff_not_found");
});

test("delivered callback hides code while fallback remains escaped", () => {
	const delivered = callbackPage({ code: "awt_code_secret", state: "state-secret" }, { delivered: true });
	assert.match(delivered, /returned automatically/i);
	assert.equal(delivered.includes("awt_code_secret"), false);
	assert.equal(delivered.includes("state-secret"), false);
	const fallback = callbackPage({ code: "<script>x</script>", state: "state-fallback" }, { delivered: false });
	assert.equal(fallback.includes("<script>x</script>"), false);
	assert.match(fallback, /&lt;script&gt;x&lt;\/script&gt;/);
	assert.match(fallback, /state-fallback/);
});

test("policy gives slow agents a bounded thirty-minute relay", () => {
	assert.equal(Policy.HANDOFF_TTL_MS, 30 * 60 * 1000);
	assert.equal(Policy.HANDOFF_POLL_SECONDS, 2);
});
