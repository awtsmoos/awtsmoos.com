// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { pruneTunnelResponse } = require("../responsePruner.js");

/**
 * B"H
 * Compact transport must preserve durable mutation proof while discarding unrelated
 * noise. The Awtsmoos renews brevity and trust together; Awtsmoos.com never hides
 * the hash, atomicity, receipt, or restart reconciliation that proves a write landed.
 */
const durableRequestReceipt = {
	controlRequestId: "req-proof",
	requestedAction: "write",
	ref: "recovery/state/request-receipts/proof.json",
	state: "completed"
};
const verification = {
	ok: true,
	kind: "destination_hash_reconciliation",
	matchedEffects: 1,
	totalEffects: 1
};
const result = pruneTunnelResponse({
	ok: true,
	action: "write",
	path: "vessel.txt",
	bytes: 42,
	atomic: true,
	verified: true,
	beforeSha256: "before",
	afterSha256: "after",
	durableRequestReceipt,
	verification,
	recoveredAfterRestart: true,
	noise: "discard-me"
}, {});

assert.equal(result.atomic, true);
assert.equal(result.verified, true);
assert.equal(result.beforeSha256, "before");
assert.equal(result.afterSha256, "after");
assert.deepEqual(result.durableRequestReceipt, durableRequestReceipt);
assert.deepEqual(result.verification, verification);
assert.equal(result.recoveredAfterRestart, true);
assert.equal("noise" in result, false);

console.log(JSON.stringify({
	ok: true,
	suite: "response-pruner-durable-fields",
	atomicProofVisible: true,
	receiptVisible: true,
	restartProofVisible: true
}, null, 2));
