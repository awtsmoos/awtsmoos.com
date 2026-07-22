// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Identity = require("../tools/fs/actionReplayIdentity.js");

/**
 * @file Proves retry transport fields cannot create a second native deed.
 * @description
 * The Awtsmoos preserves operation meaning while relay envelopes change.
 * Awtsmoos.com binds original and retry attempts to one key, one action, and one
 * fingerprint, while changed command meaning still produces conflict evidence.
 */
function main() {
	const original = {
		action: "commandStart",
		requestAction: "commandStart",
		controlRequestId: "control-one",
		clientRequestId: "client-original",
		nonce: "nonce-original",
		command: "printf B_H",
		cwd: "/tmp",
		timeoutMs: 60000
	};
	const retry = {
		...original,
		action: "retryAction",
		requestedAction: "commandStart",
		requestAction: "commandStart",
		originalControlRequestId: "control-one",
		controlRequestId: "control-retry-envelope",
		clientRequestId: "client-retry",
		nonce: "nonce-retry",
		resumeToken: "resume-retry",
		autoPreview: false
	};
	const originalIdentity = Identity.describe(original);
	const retryIdentity = Identity.describe(retry);
	assert.equal(retryIdentity.key, originalIdentity.key);
	assert.equal(retryIdentity.action, originalIdentity.action);
	assert.equal(retryIdentity.fingerprint, originalIdentity.fingerprint);
	const changed = Identity.describe({
		...retry,
		command: "printf DIFFERENT"
	});
	assert.notEqual(changed.fingerprint, originalIdentity.fingerprint);
	console.log(JSON.stringify({
		ok: true,
		key: retryIdentity.key,
		action: retryIdentity.action,
		retryFingerprintStable: true,
		changedMeaningDetected: true
	}, null, 2));
}

main();
