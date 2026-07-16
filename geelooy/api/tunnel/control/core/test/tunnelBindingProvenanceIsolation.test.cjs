// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Authorization = require("../tunnelSecurity/authorization.js");
const Store = require("../store.js");
const Inventory = require("../../routes/fsVessel/accountInventory.js");
const Test = require("./tunnelSecurityTestContext.cjs");

/**
 * @file Proves discovery needs pairing provenance and exact live identity.
 * @description
 * The Awtsmoos renews owner, record, and socket without permitting legacy text
 * to become truth. Awtsmoos.com hides unproven bindings, foreign IDs, forged live
 * sockets, and machine-inventory metadata from every account discovery response.
 */
function main() {
	const context = Test.createSecurityContext();
	try {
		const alice = Test.addBinding(Test.bindingInput("alice", "alice", "same"));
		const bob = Test.addBinding(Test.bindingInput("bob", "bob", "same"));
		injectLegacyBinding();
		assert.deepEqual(idsFor("alice"), [alice.tunnelId]);
		assert.deepEqual(idsFor("bob"), [bob.tunnelId]);
		assert.equal(
			Authorization.resolveAccessible("alice", bob.tunnelId).error,
			"tunnel_not_found"
		);
		const server = serverFixture(alice);
		const discovered = Inventory.inventory(server, "alice");
		assert.equal(discovered.nativeDevices.length, 1);
		assert.equal(discovered.nativeDevices[0].tunnelId, alice.tunnelId);
		assert.equal(discovered.nativeDevices[0].connected, true);
		assert.equal(discovered.nativeDevices[0].ownershipVerified, true);
		assertNoMachineInventory(discovered);
		console.log("BHY binding provenance discovery matrix passed");
	} finally {
		context.cleanup();
	}
}

function injectLegacyBinding() {
	Store.mutateStore((store) => {
		store.tunnelBindings.tun_legacy = {
			tunnelId: "tun_legacy",
			tunnelName: "legacy",
			deviceId: "legacy-device",
			ownerAccountId: "alice",
			credentialDigest: "x".repeat(64),
			devicePublicKey: "legacy-key",
			permissionVersion: 1,
			revocationVersion: 1,
			revokedAt: null
		};
		return store;
	});
}

function serverFixture(binding) {
	const real = nativeClient(binding);
	const forged = nativeClient({
		...binding,
		tunnelId: "tun_forged",
		deviceId: "forged-device"
	});
	forged.root = "/private/foreign/root";
	forged.tools = { secretTool: true };
	forged.limits = { internal: true };
	forged.allowSecrets = true;
	forged.capabilityProfile = { schemaVersion: 1, capabilities: {} };
	return {
		tunnelClients: new Map([["real", real], ["forged", forged]]),
		ws: { clients: new Set([real, forged]) }
	};
}

function nativeClient(binding) {
	return {
		isTunnel: true,
		accessKind: "device",
		accountId: binding.ownerAccountId,
		tunnelId: binding.tunnelId,
		deviceId: binding.deviceId,
		tunnelName: binding.tunnelName,
		deviceName: binding.deviceName,
		platform: binding.platform,
		vesselType: "native",
		allowCommands: true,
		allowWrite: true,
		isAlive: true,
		registeredAt: Date.now()
	};
}

function idsFor(accountId) {
	return Authorization.accessibleBindings(accountId)
		.map((entry) => entry.binding.tunnelId);
}

function assertNoMachineInventory(value) {
	const serialized = JSON.stringify(value);
	for (const forbidden of [
		"/private/foreign/root",
		"secretTool",
		"allowSecrets",
		"capabilityProfile",
		"limits"
	]) {
		assert.equal(serialized.includes(forbidden), false);
	}
}

main();
