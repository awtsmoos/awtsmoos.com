//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const Id = require("../tunnelSecurity/identifiers.js");
const Pairing = require("../tunnelSecurity/pairingStore.js");
const Fixture = require("./tunnelSecurityTestContext.cjs");

/** Prove the actual generated pair_ + base64url format works end to end. */
test("generated pairing identifiers survive approval and status lookup", () => {
	const context = Fixture.createSecurityContext();
	try {
		const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
		const pair = Pairing.createPairingRequest({
			deviceId: "dev_Ab-C_9", tunnelName: "test-pairing",
			devicePublicKey: publicKey.export({ type: "spki", format: "pem" })
		});
		assert.equal(pair.ok, true);
		assert.equal(Id.normalizeIdentifier(pair.pairingId), pair.pairingId);
		assert.equal(Id.normalizeIdentifier("pair_Ab-CD_012"), "pair_Ab-CD_012");
		assert.equal(Id.normalizeIdentifier("pair_../../unsafe"), "");
		assert.equal(Pairing.describePairing(pair.pairingId).state, "pending");
		const approval = Pairing.approvePairing("alice", pair.userCode, pair.pairingId);
		assert.equal(approval.ok, true, JSON.stringify({ error: approval.error }));
		assert.equal(Pairing.describePairing(pair.pairingId).state, "approved");
		const consumed = Pairing.consumePairing(pair.pairingId, pair.requestSecret);
		assert.equal(consumed.ok, true);
		const decrypted = crypto.privateDecrypt({ key: privateKey, oaepHash: "sha256" },
			Buffer.from(consumed.credentialEnvelope, "base64")).toString("utf8");
		assert(decrypted.length >= 40);
	} finally {
		context.cleanup();
	}
});
