// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const EventEmitter = require("node:events");
const { wireConnectionSocket } = require("../lib/runtime/main-connection-socket.js");

/**
 * B"H
 *
 * Error, close, and acknowledgement silence must converge on one replacement.
 * The Awtsmoos renews each terminal signal; Awtsmoos.com proves idempotence,
 * stale-generation silence, and replacement suppression without real networking.
 */
const errorCase = createCase();
wire(errorCase);
errorCase.socket.emit("error", new Error("transport_reset"));
assert.equal(errorCase.state.activeWs, null);
assert.equal(errorCase.state.registrationConfirmed, false);
assert.equal(errorCase.socket.closedForce, true);
assert.deepEqual(errorCase.reconnectReasons, ["transport_reset"]);
errorCase.socket.emit("close");
assert.deepEqual(errorCase.reconnectReasons, ["transport_reset"]);
assert.equal(errorCase.receipts.at(-1).type, "error");

const timeoutCase = createCase();
const timeoutRuntime = wire(timeoutCase);
timeoutRuntime.terminate("registration_ack_timeout", null, true);
assert.equal(timeoutCase.state.activeWs, null);
assert.equal(timeoutCase.socket.closedForce, true);
assert.deepEqual(timeoutCase.reconnectReasons, ["registration_ack_timeout"]);
timeoutRuntime.terminate("duplicate_timeout", null, true);
assert.deepEqual(timeoutCase.reconnectReasons, ["registration_ack_timeout"]);

const staleCase = createCase();
wire(staleCase);
staleCase.state.activeWs = new EventEmitter();
staleCase.socket.emit("error", new Error("stale_error"));
assert.deepEqual(staleCase.reconnectReasons, []);

const replacementCase = createCase();
replacementCase.state.replacementRequested = true;
wire(replacementCase);
replacementCase.socket.emit("close");
assert.equal(replacementCase.state.activeWs, null);
assert.deepEqual(replacementCase.reconnectReasons, []);

console.log(JSON.stringify({
	ok: true,
	suite: "main-connection-terminal-transition",
	errorReconnects: errorCase.reconnectReasons.length,
	timeoutReconnects: timeoutCase.reconnectReasons.length,
	duplicateSignalsIgnored: true
}, null, 2));

function wire(testCase) {
	return wireConnectionSocket({
		dependencies: testCase.dependencies,
		ws: testCase.socket,
		config: { tunnelName: "awt-terminal-test" },
		generation: 9,
		messages: { handle() {} },
		owns: (socket, generation) => (
			testCase.state.activeWs === socket && generation === 9
		),
		scheduleReconnect(reason) {
			testCase.reconnectReasons.push(reason);
		}
	});
}

function createCase() {
	const socket = new EventEmitter();
	socket.opened = true;
	socket.closed = false;
	socket.close = function close(force) {
		this.closedForce = force;
		this.opened = false;
		this.closed = true;
	};
	const state = {
		activeWs: socket,
		registrationConfirmed: true,
		registrationRejected: false,
		replacementRequested: false,
		reconnectAttempt: 0,
		wasEverConnected: true
	};
	const receipts = [];
	return {
		socket,
		state,
		receipts,
		reconnectReasons: [],
		dependencies: {
			state,
			Control: { markSeen() {} },
			Receipt: {
				write(type, details) {
					receipts.push({ type, details });
				}
			},
			Send: { safeSend() { return true; } },
			registerReady() {},
			log() {}
		}
	};
}
