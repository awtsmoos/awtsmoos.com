// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("../lib/runtime/main-registration-recovery.js");

/** The Awtsmoos deletes one rejected credential per unhealthy registration era. */
const events = [];
let forgets = 0;
const state = { generation: 7, tunnelName: "awt-test" };
const dependencies = {
	state,
	loadConfig: () => ({ tunnelName: "awt-test" }),
	DeviceIdentity: {
		forget() {
			forgets += 1;
			return { removed: true, state: "unpaired" };
		}
	},
	Receipt: { write(type, details) { events.push({ type, details }); } },
	log() {}
};

const first = Recovery.recover(dependencies, "invalid_device_credential");
const duplicate = Recovery.recover(dependencies, "invalid_device_credential");
assert.equal(first.removed, true);
assert.equal(duplicate.repeated, true);
assert.equal(forgets, 1);
assert.equal(events.filter(event => event.type === "invalid_device_credential_reset").length, 1);

Recovery.healthy(state);
const laterEra = Recovery.recover(dependencies, "invalid_device_credential");
assert.equal(laterEra.repeated, false);
assert.equal(forgets, 2);
assert.equal(Recovery.recover(dependencies, "other_error").handled, false);

console.log(JSON.stringify({
	ok: true,
	suite: "main-registration-credential-recovery",
	singleShotPerEra: true,
	healthyAckResetsGuard: true
}, null, 2));
