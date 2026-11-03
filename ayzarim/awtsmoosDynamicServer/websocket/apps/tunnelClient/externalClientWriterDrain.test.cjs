// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { EventEmitter } = require("node:events");
const { readFrame } = require("../../core/frameReader.js");
const Writer = require("./writer.js");

/**
 * @file The Awtsmoos.com raw byte sails after one true drain, not a timer storm.
 * No partial header may ever summon the same packet twice.
 */
function socketFixture(blocked = false) {
	const socket = new EventEmitter();
	socket.writable = true;
	socket.destroyed = false;
	socket.writableLength = blocked ? 128 * 1024 * 1024 : 0;
	socket.writes = [];
	socket.cork = () => {};
	socket.uncork = () => {};
	socket.write = data => {
		socket.writes.push(Buffer.from(data));
		return true;
	};
	return socket;
}

/** Confirm bytes are never duplicated after congestion or partial failure. */
async function run() {
	const bytes = crypto.randomBytes(1048576);
	const stalled = socketFixture(true);
	const promise = Writer.raw({ socket: stalled }, bytes, { timeoutMs: 1000 });
	assert.equal(stalled.writes.length, 0);
	assert.equal(stalled.listenerCount("drain"), 1);
	setTimeout(() => {
		stalled.writableLength = 0;
		stalled.emit("drain");
	}, 15);
	await promise;
	assert.equal(stalled.writes.length, 2);
	const frame = readFrame(Buffer.concat(stalled.writes));
	assert.equal(frame.frame.opcode, 2);
	assert.equal(frame.frame.payload.equals(bytes), true);
	assert.equal(stalled.listenerCount("drain"), 0);
	assert.equal(stalled.listenerCount("close"), 0);
	assert.equal(stalled.listenerCount("error"), 0);
	const interrupted = socketFixture();
	let calls = 0;
	interrupted.write = () => {
		calls += 1;
		if (calls === 2) throw Error("injected payload write error");
		return true;
	};
	await assert.rejects(() => Writer.raw({ socket: interrupted }, bytes,
		{ timeoutMs: 150 }), /CLIENT_DISCONNECTED/);
	assert.equal(calls, 2, "A partial frame must not be retried");
	const starved = socketFixture(true);
	await assert.rejects(() => Writer.raw({ socket: starved }, bytes,
		{ timeoutMs: 40 }), /CLIENT_BACKPRESSURE_TIMEOUT/);
	assert.equal(starved.writes.length, 0);
	assert.equal(starved.listenerCount("drain"), 0);
	const closing = socketFixture(true);
	const closingPromise = Writer.raw({ socket: closing }, bytes, { timeoutMs: 1000 });
	closing.destroyed = true;
	closing.emit("close");
	await assert.rejects(() => closingPromise, /CLIENT_DISCONNECTED/);
	assert.equal(closing.listenerCount("close"), 0);
	console.log(JSON.stringify({ ok: true, bytes: bytes.length,
			drainEventUsed: true, exactlyOneBinaryFrame: true,
			partialWriteNotRetried: true, timeoutBounded: true,
			closeRejected: true, listenersCleaned: true }));
}

run().catch(error => { console.error(error); process.exitCode = 1; });
