// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const ReceiptValue = require("../lib/runtime/connection-receipt-value.js");
const Terminal = require("../lib/runtime/main-connection-terminal.js");
const RemoteClose = require("../lib/ws/remoteClose.js");

/**
 * @file Proves terminal classification and durable receipt testimony agree.
 * @description
 * The Awtsmoos makes one polite relay close visible from socket ending to durable
 * Awtsmoos.com evidence, without widening identity or replacement authority.
 */
test("registered bare 1000 is classified before registration is cleared", () => {
	const receipts = [];
	const state = {
		activeWs: {},
		generation: 3,
		lastRegisteredAt: 9000,
		recentFailures: [],
		reconnectAttempt: 0,
		registrationConfirmed: true,
		remoteClose1000LastAt: 0,
		remoteClose1000Streak: 0,
		replacementRequested: false,
		tunnelId: "tun_test"
	};
	const ws = {
		lastFailure: RemoteClose.failure({ code: 1000, reason: "", valid: true }),
		close() {}
	};
	let scheduled = "";
	const terminator = Terminal.createConnectionTerminator({
		dependencies: {
			state,
			env: {},
			now: () => 10000,
			Receipt: { write: (type, details) => receipts.push({ type, details }) },
			log() {}
		},
		ws,
		config: { tunnelName: "awt-test" },
		generation: 3,
		owns: () => true,
		releaseObservers() {},
		scheduleReconnect: reason => {
			scheduled = reason;
		}
	});
	assert.equal(terminator.terminate("remote_close_1000", "closed", false), true);
	assert.equal(state.registrationConfirmed, false);
	assert.equal(state.remoteClose1000Streak, 1);
	assert.equal(receipts[0].details.reconnectMinimumDelayMs, 250);
	assert.equal(receipts[0].details.lastFailure.code, "websocket_remote_close_1000");
	assert.equal(scheduled, "remote_close_1000");
});

test("receipt normalization carries additive cooldown fields without schema break", () => {
	const value = ReceiptValue.normalize({
		state: "registered",
		pid: 44,
		reconnectMinimumDelayMs: 16000,
		remoteClose1000Streak: 4,
		remoteClose1000LastAt: 123456,
		lastRegisteredDurationMs: 9000
	});
	assert.equal(value.schemaVersion, 5);
	assert.equal(value.reconnectMinimumDelayMs, 16000);
	assert.equal(value.remoteClose1000Streak, 4);
	assert.equal(value.remoteClose1000LastAt, 123456);
	assert.equal(value.lastRegisteredDurationMs, 9000);
});
