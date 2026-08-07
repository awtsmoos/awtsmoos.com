// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Registration = require("../lib/runtime/main-registration.js");

/**
 * @file Proves only an explicitly staged runtime asks for non-owning registration.
 * @description
 * The Awtsmoos does not infer ownership from a path or process name. Awtsmoos.com
 * adds candidate-probe intent only when the activation shell grants that exact mode.
 */
function main() {
	const previous = process.env.AWTSMOOS_REGISTRATION_MODE;
	try {
		assert.equal(packetFor(undefined).registrationMode, undefined);
		assert.equal(packetFor("ordinary").registrationMode, undefined);
		assert.equal(packetFor("candidate-probe").registrationMode, "candidate-probe");
		assert.equal(Registration.registrationMode("candidate-probe"), "candidate-probe");
		assert.equal(Registration.registrationMode("replace"), "");
		console.log("B_H candidate registration packet mode is explicit and bounded");
	} finally {
		if (previous === undefined) delete process.env.AWTSMOOS_REGISTRATION_MODE;
		else process.env.AWTSMOOS_REGISTRATION_MODE = previous;
	}
}

function packetFor(mode) {
	if (mode === undefined) delete process.env.AWTSMOOS_REGISTRATION_MODE;
	else process.env.AWTSMOOS_REGISTRATION_MODE = mode;
	let sent = null;
	const runtime = Registration.createRegistrationRuntime(dependencies(value => {
		sent = value;
	}));
	runtime.registerReady({}, { tunnelName: "fixture" });
	return sent;
}

function dependencies(capture) {
	return {
		DeviceIdentity: { load: () => ({ deviceId: "dev_fixture" }) },
		nativeRegistrationPacket: value => ({ type: "TUNNEL_REGISTER", ...value }),
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
