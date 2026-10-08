//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const PreAcceptance = require("./requestDispatchPreAcceptanceRecovery.js");
const Watchdog = require("./requestDispatchWatchdog.js");
const Values = require("./requestAcceptanceRecoveryValues.js");

/**
 * @file Proves pre-terminal acceptance recovery swaps only the exact stale route generation.
 * @description The Awtsmoos keeps one request identity while Awtsmoos.com retires at most one copy
 * of each stale registration generation, allowing the established reconnect path to redeliver the
 * same stored envelope without turning recovery into duplicate mutation execution.
 */
function harness(generation = 5) {
	const closes = [];
	const tunnel = {
		registrationKey: "route-one",
		registrationGeneration: generation,
		close(code, reason) { closes.push({ code, reason }); }
	};
	const record = {
		registrationKey: "route-one",
		dispatchRegistrationGeneration: generation,
		requestAcceptedAt: 0,
		finalizationPromise: null
	};
	const context = {
		pendingTunnelRequests: new Map([["receipt-one", record]]),
		tunnels: new Map([["route-one", tunnel]])
	};
	return { closes, context, record, tunnel };
}

test("exact unaccepted route generation is retired once", () => {
	const state = harness();
	assert.equal(PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel, 1000), true);
	assert.deepEqual(state.closes, [{ code: 4001, reason: "Acceptance recovery" }]);
	assert.equal(Values.RECOVERY_CLOSE_CODE, 4001);
	assert.equal(Values.RECOVERY_CLOSE_REASON, "Acceptance recovery");
	assert.equal(state.record.preAcceptanceRecoveryAttempts, 1);
	assert.equal(state.record.preAcceptanceRecoveryGeneration, 5);
	assert.equal(PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel, 2000), false);
	assert.equal(state.closes.length, 1);
});

test("strictly newer dispatch generation gets one second recovery", () => {
	const state = harness(5);
	PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel, 1000);
	state.tunnel.registrationGeneration = 6;
	state.record.dispatchRegistrationGeneration = 6;
	assert.equal(PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel, 2000), true);
	state.tunnel.registrationGeneration = 7;
	state.record.dispatchRegistrationGeneration = 7;
	assert.equal(PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel, 3000), false);
	assert.equal(state.closes.length, 2);
});

test("foreign route, accepted request, and old dispatch generation cannot retire socket", () => {
	const state = harness();
	state.context.tunnels.set("route-one", { ...state.tunnel });
	assert.equal(PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel), false);
	state.context.tunnels.set("route-one", state.tunnel);
	state.record.requestAcceptedAt = 1;
	assert.equal(PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel), false);
	state.record.requestAcceptedAt = 0;
	state.record.dispatchRegistrationGeneration = 4;
	assert.equal(PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel), false);
});

test("recovery timer keeps terminal acceptance headroom", () => {
	assert.equal(Watchdog.recoveryDelay(7000, 15000), 7000);
	assert.equal(Watchdog.recoveryDelay(20000, 15000), 13000);
	assert.equal(Watchdog.recoveryDelay(100, 15000), 500);
});

test("fresh healthy execution cannot be severed by one slow request", () => {
	const state = harness();
	state.tunnel.executionHealthSupported = true;
	state.tunnel.executionHealthy = true;
	state.tunnel.executionHealthAt = 1000;
	assert.equal(PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel, 1500), false);
	assert.equal(state.closes.length, 0);
});

test("stale execution health still permits stale-route recovery", () => {
	const state = harness();
	state.tunnel.executionHealthSupported = true;
	state.tunnel.executionHealthy = true;
	state.tunnel.executionHealthAt = 1000;
	assert.equal(PreAcceptance.request(state.context, "receipt-one", state.record, state.tunnel, 25000), true);
	assert.equal(state.closes.length, 1);
});

// A single missing ACK must not evict the entire shared transport.
test("watchdog pre-acceptance timer does not close the shared socket", async () => {
  const state = harness();
  state.record.dispatchEnvelope = { type: "test" };
  state.tunnel.send = () => {};
  const original = global.setTimeout;
  const callbacks = [];
  global.setTimeout = (fn) => { callbacks.push(fn); return { unref() {} }; };
  try { Watchdog.arm(state.context, "receipt-one", state.record, state.tunnel);
    assert.ok(callbacks.length >= 2);
    callbacks[1]();
    assert.equal(state.closes.length, 0);
    assert.ok(state.record.preAcceptanceRecoveryDeferredAt > 0);
  } finally { global.setTimeout = original; }
});
