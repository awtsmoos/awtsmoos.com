// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Cooldown = require("../lib/runtime/main-remote-close-cooldown.js");
const Scheduler = require("../lib/runtime/main-reconnect-scheduler.js");

/**
 * @file Proves repeated registered bare-1000 closes gain bounded patient spacing.
 * @description
 * The Awtsmoos lets Awtsmoos.com remember only the narrow relay-close storm: short
 * registered lives cool progressively, while stability or another failure dissolves it.
 */
const bareClose = {
	code: "websocket_remote_close_1000",
	message: "remote_close_1000"
};

test("bare 1000 streak grows, caps, expires, and resets after stability", () => {
	const state = registeredState(9000);
	let result = Cooldown.observeTerminal(state, bareClose, { now: 10000 });
	assert.equal(result.remoteClose1000Streak, 1);
	assert.equal(result.minimumDelayMs, 2000);

	state.registrationConfirmed = true;
	state.lastRegisteredAt = 11000;
	result = Cooldown.observeTerminal(state, bareClose, { now: 12000 });
	assert.equal(result.remoteClose1000Streak, 2);
	assert.equal(result.minimumDelayMs, 4000);

	state.registrationConfirmed = true;
	state.lastRegisteredAt = 13000;
	state.remoteClose1000Streak = 8;
	result = Cooldown.observeTerminal(state, bareClose, { now: 14000 });
	assert.equal(result.minimumDelayMs, 30000);

	state.registrationConfirmed = true;
	state.lastRegisteredAt = 200000;
	result = Cooldown.observeTerminal(state, bareClose, { now: 201000 });
	assert.equal(result.remoteClose1000Streak, 1);

	state.registrationConfirmed = true;
	state.lastRegisteredAt = 210000;
	state.remoteClose1000Streak = 4;
	result = Cooldown.observeTerminal(state, bareClose, { now: 280000 });
	assert.equal(result.stabilityReset, true);
	assert.equal(result.remoteClose1000Streak, 1);
});

test("reasoned close is ordinary and stable non-target failure clears old pressure", () => {
	const state = registeredState(1000);
	state.remoteClose1000Streak = 3;
	state.remoteClose1000LastAt = 2000;
	const reasoned = { ...bareClose, message: "remote_close_1000:maintenance" };
	let result = Cooldown.observeTerminal(state, reasoned, { now: 3000 });
	assert.equal(result.minimumDelayMs, 0);
	assert.equal(state.remoteClose1000Streak, 3);

	state.registrationConfirmed = true;
	state.lastRegisteredAt = 1000;
	result = Cooldown.observeTerminal(state, { code: "EPIPE", message: "write EPIPE" }, { now: 70000 });
	assert.equal(result.stabilityReset, true);
	assert.equal(state.remoteClose1000Streak, 0);
});

test("reconnect scheduler honors bare-1000 minimum without changing generation fencing", () => {
	const state = registeredState(1000);
	state.registrationConfirmed = false;
	state.generation = 7;
	state.remoteClose1000Streak = 4;
	state.lastFailure = bareClose;
	const timers = [];
	const receipts = [];
	const scheduler = Scheduler.createReconnectScheduler({
		state,
		env: {},
		random: () => 0.5,
		setReconnectTimer(callback, delay) {
			const timer = { callback, delay };
			timers.push(timer);
			return timer;
		},
		clearReconnectTimerHandle() {},
		Receipt: { write: (type, details) => receipts.push({ type, details }) }
	}, () => {});
	const timer = scheduler.schedule("remote_close_1000");
	assert.equal(timer.delay, 16000);
	assert.equal(receipts[0].details.reconnectMinimumDelayMs, 16000);
	assert.equal(receipts[0].details.remoteClose1000Streak, 4);
});

function registeredState(lastRegisteredAt) {
	return {
		generation: 1,
		lastRegisteredAt,
		reconnectAttempt: 0,
		reconnectGeneration: null,
		reconnectTimer: null,
		registrationConfirmed: true,
		remoteClose1000LastAt: 0,
		remoteClose1000Streak: 0,
		replacementRequested: false,
		tunnelId: "tun_test",
		tunnelName: "awt-test"
	};
}
