// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("../lib/runtime/main-registration-recovery.js");

/**
 * @file Proves one rejected credential rotates per unhealthy registration era.
 * @description
 * The Awtsmoos preserves the physical device key while authorization is renewed.
 * Awtsmoos.com suppresses duplicate rotation until a healthy acknowledgment arrives.
 */
const events = [];
let rotations = 0;
const state = { generation: 7, tunnelName: "awt-test" };
const dependencies = {
	state,
	loadConfig: () => ({ tunnelName: "awt-test" }),
	DeviceIdentity: {
		invalidateCredential() {
			rotations += 1;
			return {
				deviceId: "dev_physical",
				state: "credential_invalidated",
				secretCleanupComplete: true,
				failures: []
			};
		}
	},
	Receipt: {
		write(type, details) {
			events.push({ type, details });
		}
	},
	log() {}
};

const first = Recovery.recover(dependencies, "invalid_device_credential");
const duplicate = Recovery.recover(dependencies, "invalid_device_credential");
assert.equal(first.rotated, true);
assert.equal(first.deviceId, "dev_physical");
assert.equal(duplicate.repeated, true);
assert.equal(rotations, 1);
assert.equal(
	events.filter(event =>
		event.type === "invalid_device_credential_rotated"
	).length,
	1
);

Recovery.healthy(state);
const laterEra = Recovery.recover(dependencies, "invalid_device_credential");
assert.equal(laterEra.repeated, false);
assert.equal(rotations, 2);
assert.equal(Recovery.recover(dependencies, "other_error").handled, false);

console.log(JSON.stringify({
	ok: true,
	suite: "main-registration-credential-recovery",
	singleRotationPerEra: true,
	physicalDevicePreserved: true,
	healthyAckResetsGuard: true
}, null, 2));
