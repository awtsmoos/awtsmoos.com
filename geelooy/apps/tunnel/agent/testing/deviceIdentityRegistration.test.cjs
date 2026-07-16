// B"H

const assert = require("node:assert/strict");
const { nativeRegistrationPacket } = require("../lib/registration.js");
const { createRegistrationRuntime } = require("../lib/runtime/main-registration.js");
const { ensureDeviceIdentity } = require("../lib/runtime/main-startup.js");

const packet = nativeRegistrationPacket({
	config: { tunnelName: "awt-test", tools: {} },
	agentVersion: "test",
	identity: {
		ok: true,
		deviceId: "dev_test",
		tunnelId: "tun_test",
		deviceCredential: "secret-test-credential",
		credentialVersion: 2
	}
});
assert.equal(packet.deviceId, "dev_test");
assert.equal(packet.tunnelId, "tun_test");
assert.equal(packet.deviceCredential, "secret-test-credential");
assert.equal(packet.name, "awt-test");
const unpaired = nativeRegistrationPacket({
	config: { tunnelName: "awt-test", tools: {} },
	agentVersion: "test",
	identity: { ok: false, state: "unpaired", error: "device_pairing_required" }
});
assert.equal(unpaired.deviceCredential, undefined);
assert.equal(unpaired.pairingState, "unpaired");

let sent;
createRegistrationRuntime({
	DeviceIdentity: { load: () => ({ ...packet, ok: true }) },
	nativeRegistrationPacket: options => options.identity,
	AGENT_VERSION: "test",
	workers: { status: () => ({}) },
	Priority: { PRIORITY_ACTIONS: [] },
	Limits: { LANE_LIMITS: {}, REQUESTER_LANE_LIMITS: {} },
	Send: { safeSend: (_ws, value) => (sent = value) }
}).registerReady({}, {});
assert.equal(sent.deviceCredential, "secret-test-credential");

(async () => {
	let pairingCalls = 0;
	const paired = await ensureDeviceIdentity({
		DeviceIdentity: {
			load: () => ({ ok: false, state: "unpaired" }),
			pair: async () => (pairingCalls++, { ok: true, state: "paired" })
		},
		log() {}
	}, {});
	assert.equal(paired.ok, true);
	assert.equal(pairingCalls, 1);
	console.log(JSON.stringify({ ok: true, suite: "device-identity-registration" }));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
