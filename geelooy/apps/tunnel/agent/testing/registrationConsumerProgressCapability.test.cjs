// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Registration = require("../lib/runtime/main-registration.js");

/**
 * @file Proves the modern agent explicitly negotiates consumer-progress v2 support.
 * @description
 * The Awtsmoos lets strictness arise from a spoken capability, never a guessed age.
 * Awtsmoos.com therefore records one boolean promise in every modern native packet.
 */
function main() {
	let sent = null;
	const runtime = Registration.createRegistrationRuntime(dependencies(packet => {
		sent = packet;
	}));
	runtime.registerReady({}, { tunnelName: "fixture" });
	assert.ok(sent);
	assert.equal(sent.capabilities?.consumerProgressV2, true);
	assert.equal(Registration.CONSUMER_PROGRESS_CAPABILITY, "consumerProgressV2");
	console.log(JSON.stringify({
		ok: true,
		suite: "registration-consumer-progress-capability",
		consumerProgressV2: true
	}, null, 2));
}

function dependencies(capture) {
	return {
		DeviceIdentity: { load: () => ({ deviceId: "dev_fixture" }) },
		nativeRegistrationPacket: value => ({
			type: "TUNNEL_REGISTER",
			capabilities: { existingCapability: true },
			...value
		}),
		AGENT_VERSION: "fixture",
		Priority: { PRIORITY_ACTIONS: [] },
		Limits: {
			LANE_LIMITS: {}, REQUESTER_LANE_LIMITS: {}, CONTROL_QUEUE_LIMIT: 1,
			WAIT_QUEUE_LIMIT: 1, OBSERVE_QUEUE_LIMIT: 1, MAX_QUEUE: 1,
			LONG_LIVED_CONNECTIONS: true, KEEPALIVE_MS: 1000
		},
		workers: { status: () => ({ activeTotal: 0 }) },
		Send: { safeSend: (_ws, packet) => capture(packet) }
	};
}

main();
