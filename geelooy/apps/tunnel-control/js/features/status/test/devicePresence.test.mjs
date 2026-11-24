// B"H
import assert from "assert";
global.document = { getElementById: () => null, createElement: () => ({ classList: { add() {}, remove() {} } }) };
const { deviceState } = await import("../deviceCards.js");
assert.equal(deviceState({ presence: "connected" }), "connected");
assert.equal(deviceState({ presence: "degraded", connected: true, isAlive: true }), "degraded");
assert.equal(deviceState({ presence: "offline", connected: true }), "offline");
assert.equal(deviceState({ connected: true, isAlive: true }), "connected");
assert.equal(deviceState({ connected: false }), "offline");
assert.equal(deviceState({}), "unknown");
assert.equal(deviceState({ tunnelName: "stale-record" }), "unknown");
console.log("B'H device presence honesty ok");
