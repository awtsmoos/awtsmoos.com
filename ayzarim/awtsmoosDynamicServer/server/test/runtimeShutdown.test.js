//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file runtimeShutdown.test.js
 * @description Proves readiness falls before transport draining and shutdown remains idempotent.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	bindRuntimeShutdown,
	closeRealtime
} = require("../runtimeShutdown.js");

function fakeProcess() {
	const handlers = new Map();
	return {
		exitCodes: [],
		once(signal, handler) {
			handlers.set(signal, handler);
		},
		exit(code) {
			this.exitCodes.push(code);
		},
		emit(signal) {
			handlers.get(signal)?.();
		}
	};
}
test("shutdown marks draining, closes HTTP, and exits once", async () => {
	const events = [];
	const processRef = fakeProcess();
	const httpServer = {
		listening: true,
		close(callback) {
			events.push("http-close");
			callback();
		},
		closeIdleConnections() {
			events.push("idle-close");
		}
	};
	const health = {
		markDraining() {
			events.push("draining");
		}
	};
	const shutdown = bindRuntimeShutdown({
		processRef,
		health,
		httpServer,
		wsServer: { clients: [] },
		graceMs: 25
	});
	await shutdown("test");
	await shutdown("again");
	assert.equal(events[0], "draining");
	assert.equal(events.filter(value => value === "http-close").length, 1);
	assert.deepEqual(processRef.exitCodes, [0]);
});
test("registered SIGTERM enters the same shutdown path", async () => {
	const processRef = fakeProcess();
	let draining = 0;
	bindRuntimeShutdown({
		processRef,
		health: { markDraining() { draining += 1; } },
		httpServer: { listening: false },
		wsServer: { clients: [] }
	});
	processRef.emit("SIGTERM");
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(draining, 1);
	assert.deepEqual(processRef.exitCodes, [0]);
});

test("realtime clients receive restart close semantics", () => {
	const closes = [];
	closeRealtime({
		clients: [
			{ close(code, reason) { closes.push([code, reason]); } },
			{ close(code, reason) { closes.push([code, reason]); } }
		]
	});
	assert.deepEqual(closes, [
		[1012, "Server restart"],
		[1012, "Server restart"]
	]);
});
