// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Scheduler = require("../lib/runtime/main-reconnect-scheduler.js");

/**
 * @file Proves one generation owns one timer, stale callbacks vanish, and network return stays fast.
 * @description
 * The Awtsmoos lets the retry clock serve the living generation alone. Awtsmoos.com
 * collapses duplicate signals, fences elder callbacks, and keeps long physical outages
 * on one bounded rapid-return rhythm without ever birthing a second socket worker.
 */
test("one timer per generation reconnects once and fences stale generations", () => {
	const harness = makeHarness(stateFor(4));
	const first = harness.scheduler.schedule("dns_down");
	const duplicate = harness.scheduler.schedule("duplicate_signal");
	assert.equal(first, duplicate);
	assert.equal(harness.timers.length, 1);
	assert.equal(first.delay, 1000);
	assert.equal(harness.state.reconnectGeneration, 4);

	harness.state.generation = 5;
	first.callback();
	assert.equal(harness.connects(), 0);
	assert.equal(harness.state.reconnectTimer, null);

	const current = harness.scheduler.schedule("network_return");
	assert.equal(current.delay, 2000);
	current.callback();
	assert.equal(harness.connects(), 1);

	const cancelled = harness.scheduler.schedule("manual_connect");
	assert.equal(harness.scheduler.clear(), true);
	cancelled.callback();
	assert.equal(harness.connects(), 1);
	assert.deepEqual(harness.cleared, [cancelled.id]);
});

test("long DNS outage keeps the single retry timer within the fast-return cap", () => {
	const state = stateFor(12);
	state.reconnectAttempt = 99;
	const harness = makeHarness(state);
	const timer = harness.scheduler.schedule("dns_still_down");
	assert.equal(harness.timers.length, 1);
	assert.equal(timer.delay, 5000);
	assert.equal(harness.receipts[0].details.reconnectDelayMs, 5000);
	timer.callback();
	assert.equal(harness.connects(), 1);
});

function makeHarness(state) {
	const timers = [];
	const cleared = [];
	const receipts = [];
	let connectCount = 0;
	const scheduler = Scheduler.createReconnectScheduler({
		state,
		env: {},
		random: () => 0.5,
		setReconnectTimer(callback, delay) {
			const timer = { callback, delay, id: timers.length + 1 };
			timers.push(timer);
			return timer;
		},
		clearReconnectTimerHandle(timer) {
			cleared.push(timer.id);
		},
		Receipt: {
			write(type, details) {
				receipts.push({ type, details });
			}
		}
	}, () => {
		connectCount += 1;
	});
	return { state, scheduler, timers, cleared, receipts, connects: () => connectCount };
}

function stateFor(generation) {
	return {
		generation,
		reconnectTimer: null,
		reconnectGeneration: null,
		reconnectAttempt: 0,
		replacementRequested: false,
		tunnelId: "tun_test",
		tunnelName: "awt-test",
		lastFailure: { category: "dns", code: "ENOTFOUND", retryable: true },
		recentFailures: []
	};
}
