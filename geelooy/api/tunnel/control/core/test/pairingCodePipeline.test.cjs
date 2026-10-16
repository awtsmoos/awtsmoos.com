//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const Code = require("../tunnelSecurity/pairingCode.js");
const Pairing = require("../tunnelSecurity/pairingStore.js");
const Fixture = require("./tunnelSecurityTestContext.cjs");

/** Simulate the installer, authenticated approval page and device consumption. */
test("fresh code is legible and completes pairing through the saved record", () => {
	const context = Fixture.createSecurityContext();
	try {
		const pairKeys = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
		const request = Pairing.createPairingRequest({ deviceId: "dev_test_pipe",
			tunnelName: "test-pipeline", devicePublicKey: pairKeys.publicKey.export({type:"spki",format:"pem"}) });
		assert.equal(request.ok, true);
		assert.match(request.userCode, /^[A-HJ-KM-NP-Z2-9]{10}$/);
		assert.equal(Code.normalizedCode(` ${request.userCode.slice(0,5)}-${request.userCode.slice(5)} `), request.userCode);
		assert.equal(Pairing.describePairing(request.pairingId).state, "pending");
		const mismatch = Pairing.approvePairing("alice", "WRONG234", request.pairingId);
		assert.equal(mismatch.error, "pairing_code_mismatch");
		assert.equal(Pairing.describePairing(request.pairingId).state, "pending");
		assert.equal(Pairing.approvePairing("alice", request.userCode, request.pairingId).ok, true);
		assert.equal(Pairing.describePairing(request.pairingId).state, "approved");
		const completed = Pairing.consumePairing(request.pairingId, request.requestSecret);
		assert.equal(completed.ok, true);
		const decrypted = crypto.privateDecrypt({key:pairKeys.privateKey,oaepHash:"sha256"},
			Buffer.from(completed.credentialEnvelope,"base64")).toString("utf8");
		assert(decrypted.length >= 40);
	} finally { context.cleanup(); }
});

test("pairing code alphabet excludes easily confused symbols", () => {
	assert.equal(Code.ALPHABET.length, 31);
	assert(!/[01OIL]/.test(Code.ALPHABET));
	assert.equal(new Set(Array.from({length:20}, Code.createCode)).size, 20);
});
