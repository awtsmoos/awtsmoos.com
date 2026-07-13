// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { VirtualOsTunnelState } from "../state.js";

const state = new VirtualOsTunnelState({
	name: "virtual-test",
	enabled: false,
	sessionId: "session-test"
});
assert.strictEqual(state.phase, "disabled");
assert.strictEqual(state.connected, false);

state.setEnabled(true);
state.markConnecting();
assert.strictEqual(state.phase, "connecting");
state.markConnected();
assert.strictEqual(state.connected, true);
assert.strictEqual(state.phase, "connected");

state.markError("socket_failure");
assert.strictEqual(state.connected, false);
assert.strictEqual(state.phase, "error");
assert.strictEqual(state.lastError, "socket_failure");

state.markDisconnected();
assert.strictEqual(state.phase, "offline");
const snapshot = state.snapshot();
assert.strictEqual(snapshot.name, "virtual-test");
assert.strictEqual(snapshot.sessionId, "session-test");
assert(Object.isFrozen(snapshot));
console.log("BHY Virtual OS tunnel state tests passed");
