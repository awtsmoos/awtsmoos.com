// B"H

const assert = require("node:assert/strict");
const { createConnectionMessages } = require("../lib/runtime/main-connection-messages.js");

let forgotten = 0;
let closed = 0;
let receipt = null;
const state = {
	generation: 7,
	tunnelName: "awt-revoke-test",
	replacementRequested: false,
	registrationRejected: false,
	registrationFailureReason: ""
};
const messages = createConnectionMessages({
	state,
	loadConfig: () => ({ tunnelName: state.tunnelName }),
	DeviceIdentity: {
		forget() {
			forgotten++;
			return { ok: true, tunnelId: "tun_revoke_test" };
		}
	},
	Control: { markSeen() {} },
	Replacement: { isReplacementMessage: () => false },
	Receipt: { write: (phase, detail) => (receipt = { phase, detail }) },
	log() {}
});

assert.equal(messages.handle(JSON.stringify({
	type: "TUNNEL_REVOKED",
	tunnelId: "tun_revoke_test"
}), { close: () => closed++ }), true);
assert.equal(forgotten, 1);
assert.equal(closed, 1);
assert.equal(state.replacementRequested, true);
assert.equal(state.registrationRejected, true);
assert.equal(state.registrationFailureReason, "device_revoked");
assert.equal(receipt.phase, "device_revoked");
console.log(JSON.stringify({ ok: true, suite: "device-revocation-forget" }));
