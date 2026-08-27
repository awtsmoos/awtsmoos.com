// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Store = require("../store.js");
const Binding = require("../tunnelSecurity/bindingStore.js");
const Provenance = require("../tunnelSecurity/bindingProvenance.js");
const Test = require("./tunnelSecurityTestContext.cjs");

/**
 * @file Proves reinstall pairing supersedes only the same account-device-name tuple.
 * @description
 * The Awtsmoos renews one device without multiplying stale authority. Awtsmoos.com
 * revokes the former tunnel ID after new possession proof, while another device or
 * another account with the same friendly name remains isolated and untouched.
 */
const context = Test.createSecurityContext();
try {
	const first = Test.addBinding(Test.bindingInput("alice", "stable", "same-name"));
	const otherDevice = Test.addBinding(Test.bindingInput("alice", "other", "same-name"));
	const otherAccount = Test.addBinding(Test.bindingInput("bob", "stable", "same-name"));
	const replacementInput = {
		...Test.bindingInput("alice", "stable", "same-name"),
		credential: "replacement-credential",
		pairingId: "pair_test_replacement",
		ownershipVerifiedAt: new Date().toISOString()
	};
	const replacement = Test.addBinding(replacementInput);
	const store = Store.readStore();

	assert.equal(Provenance.isTrustedBinding(store.tunnelBindings[first.tunnelId]), false);
	assert.equal(store.tunnelBindings[first.tunnelId].supersededBy, replacement.tunnelId);
	assert.equal(replacement.supersededTunnelIds.includes(first.tunnelId), true);
	assert.equal(Provenance.isTrustedBinding(store.tunnelBindings[otherDevice.tunnelId]), true);
	assert.equal(Provenance.isTrustedBinding(store.tunnelBindings[otherAccount.tunnelId]), true);
	assert.equal(Provenance.isTrustedBinding(store.tunnelBindings[replacement.tunnelId]), true);

	assert.equal(Binding.verifyRegistration({
		tunnelId: first.tunnelId,
		deviceId: first.deviceId,
		tunnelName: first.tunnelName,
		credential: "credential-stable"
	}).ok, false);
	assert.equal(Binding.verifyRegistration({
		tunnelId: replacement.tunnelId,
		deviceId: replacement.deviceId,
		tunnelName: replacement.tunnelName,
		credential: replacementInput.credential
	}).ok, true);

	console.log(JSON.stringify({
		ok: true,
		suite: "tunnel-binding-supersession",
		staleAuthorityRevoked: true,
		otherDevicePreserved: true,
		crossAccountPreserved: true
	}, null, 2));
} finally {
	context.cleanup();
}
