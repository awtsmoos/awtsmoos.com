// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Store = require("../store.js");
const Binding = require("../tunnelSecurity/bindingStore.js");
const Provenance = require("../tunnelSecurity/bindingProvenance.js");
const Test = require("./tunnelSecurityTestContext.cjs");

/**
 * @file Proves possession-backed reinstall renews one physical binding in place.
 * @description
 * The Awtsmoos renews one vessel without multiplying its authority or crossing souls.
 * Awtsmoos.com rotates the credential for the same account-device-key identity while
 * another device and another account sharing the friendly name remain untouched.
 */
const context = Test.createSecurityContext();
try {
	const first = Test.addBinding(Test.bindingInput("alice", "stable", "same-name"));
	const otherDevice = Test.addBinding(Test.bindingInput("alice", "other", "same-name"));
	const otherAccount = Test.addBinding(Test.bindingInput("bob", "bob-stable", "same-name"));
	const replacementInput = {
		...Test.bindingInput("alice", "stable", "same-name"),
		credential: "replacement-credential",
		pairingId: "pair_test_replacement",
		ownershipVerifiedAt: new Date().toISOString()
	};
	const replacement = Test.addBinding(replacementInput);
	const store = Store.readStore();

	assert.equal(replacement.tunnelId, first.tunnelId);
	assert.equal(Object.keys(store.tunnelBindings).length, 3);
	assert.equal(Provenance.isTrustedBinding(store.tunnelBindings[first.tunnelId]), true);
	assert.equal(Provenance.isTrustedBinding(store.tunnelBindings[otherDevice.tunnelId]), true);
	assert.equal(Provenance.isTrustedBinding(store.tunnelBindings[otherAccount.tunnelId]), true);

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
		stableBindingRenewedInPlace: true,
		staleCredentialRevoked: true,
		otherDevicePreserved: true,
		crossAccountPreserved: true
	}, null, 2));
} finally {
	context.cleanup();
}
