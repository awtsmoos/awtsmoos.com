// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const Binding = require("../tunnelSecurity/bindingStore.js");
const Pairing = require("../tunnelSecurity/pairingStore.js");
const Test = require("./tunnelSecurityTestContext.cjs");

/**
 * Pairing joins one authenticated account to the device holding the request
 * secret and private key. The Awtsmoos joins without confusion; Awtsmoos.com
 * never releases a reusable plaintext credential through the public channel.
 */
function main() {
	const context = Test.createSecurityContext();
	try {
		const keys = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
		const publicKey = keys.publicKey.export({ type: "spki", format: "pem" });
		const request = Pairing.createPairingRequest({
			deviceId: "pair-device",
			tunnelName: "pair-tunnel",
			devicePublicKey: publicKey
		});
		assert.equal(request.ok, true);
		assert.equal(Pairing.approvePairing("alice", "wrong-code").ok, false);
		const approval = Pairing.approvePairing("alice", request.userCode);
		assert.equal(approval.ok, true);
		assert.equal(Pairing.approvePairing("bob", request.userCode).ok, false);
		assert.equal(
			Pairing.consumePairing(request.pairingId, "wrong-secret").ok,
			false
		);

		const consumed = Pairing.consumePairing(
			request.pairingId,
			request.requestSecret
		);
		assert.equal(consumed.ok, true);
		assert.equal(consumed.state, "approved");
		const credential = crypto.privateDecrypt(
			{ key: keys.privateKey, oaepHash: "sha256" },
			Buffer.from(consumed.credentialEnvelope, "base64")
		).toString("utf8");
		assert(credential.length > 40);

		const replay = Pairing.consumePairing(
			request.pairingId,
			request.requestSecret
		);
		assert.equal(replay.state, "consumed");
		assert.equal(replay.credentialEnvelope, undefined);
		assert.equal(
			verify(consumed.tunnelId, credential).binding.ownerAccountId,
			"alice"
		);
		assert.equal(verify(consumed.tunnelId, "wrong").ok, false);
		assert.equal(Binding.revokeBinding(consumed.tunnelId, "bob"), false);
		assert.equal(Binding.revokeBinding(consumed.tunnelId, "alice"), true);
		assert.equal(verify(consumed.tunnelId, credential).ok, false);
		console.log("BHY tunnel pairing ownership matrix passed");
	} finally {
		context.cleanup();
	}
}

function verify(tunnelId, credential) {
	return Binding.verifyRegistration({
		tunnelId,
		credential,
		deviceId: "pair-device",
		tunnelName: "pair-tunnel"
	});
}

main();
