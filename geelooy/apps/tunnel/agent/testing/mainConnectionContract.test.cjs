// B"H
const assert = require('node:assert/strict');
const EventEmitter = require('node:events');
const { createConnectionRuntime } = require('../lib/runtime/main-connection.js');
const Replacement = require('../lib/runtime/replacement-policy.js');

class FakeSocket extends EventEmitter {
	constructor(url) {
		super();
		this.url = url;
		this.opened = true;
		this.sent = [];
	}
	connect() { this.connected = true; }
	sendJson(value) { this.sent.push(value); }
	close(force) {
		this.closedForce = force;
		this.opened = false;
		this.emit('close');
	}
}

/** B"H — Connect, control, replacement, and ownership are verified as behavior. */
(async () => {
	const state = {
		activeWs: null,
		reconnectTimer: null,
		reconnectAttempt: 0,
		wasEverConnected: false,
		replacementRequested: false,
		generation: 0
	};
	let registered = 0;
	let enqueued = null;
	let exitCode = null;
	let exitCallback = null;
	const runtime = createConnectionRuntime({
		state,
		loadConfig: () => ({ wsUrl: 'ws://relay.test', tunnelName: 'awt-test' }),
		log: () => {},
		TinyWebSocket: FakeSocket,
		registerReady: () => { registered += 1; },
		Control: { markSeen(ws) { ws.lastSeenAt = Date.now(); } },
		Replacement,
		Send: { safeSend(ws, value) { ws.sendJson(value); } },
		stats: () => ({ queued: 0, inflight: 0 }),
		enqueueRequest: (_ws, data) => { enqueued = data; },
		exitProcess: code => { exitCode = code; },
		setTimer(callback) {
			exitCallback = callback;
			return { unref() {} };
		},
		replacementExitDelayMs: 0
	});
	const socket = runtime.connect();
	assert.equal(socket.connected, true);
	assert.equal(socket.url, 'ws://relay.test');
	socket.emit('open');
	assert.equal(registered, 1);
	socket.emit('message', JSON.stringify({ type: 'TUNNEL_PING' }));
	assert.equal(socket.sent.at(-1).type, 'TUNNEL_PONG');
	socket.emit('message', JSON.stringify({ type: 'TUNNEL_REQUEST', id: 'request-1' }));
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(enqueued.id, 'request-1');
	state.reconnectTimer = setTimeout(() => {}, 10000);
	state.reconnectTimer.unref?.();
	socket.emit('message', JSON.stringify({ type: 'TUNNEL_REPLACED', message: 'new owner' }));
	assert.equal(state.replacementRequested, true);
	assert.equal(state.reconnectTimer, null);
	assert.equal(socket.closedForce, true);
	assert.equal(exitCode, null);
	exitCallback();
	assert.equal(exitCode, 0);
	assert.equal(state.reconnectTimer, null);
	console.log(JSON.stringify({ ok: true, suite: 'main-connection-contract' }, null, 2));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
