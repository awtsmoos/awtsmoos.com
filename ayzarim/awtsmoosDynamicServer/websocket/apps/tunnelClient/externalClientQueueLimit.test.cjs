// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const Dispatch = require("./dispatch.js");
const Limits = require("./constants.js");

/**
 * @file A saturated Awtsmoos.com queue must not swallow unbounded raw bytes.
 * The Awtsmoos sets a measured shore around the waiting wave;
 * a blocked producer cannot outrun the receipts it must save.
 */
function run() {
	let destroys = 0;
	let pauses = 0;
	const messages = [];
	const client = {
		externalHello: true,
		externalQueued: Limits.MAX_QUEUED_FRAMES,
		identity: { kind: "oauth", clientId: "external-agent" },
		socket: {
			pause() { pauses++; },
			resume() {},
			destroy() { destroys++; }
		},
		send(message) { messages.push(message); }
	};
	Dispatch.dispatch({}, client, { fin: true, masked: true, opcode: 2,
		payload: Buffer.alloc(1048576) });
	assert.equal(client.externalQueued, Limits.MAX_QUEUED_FRAMES);
	assert.equal(destroys, 1);
	assert.equal(messages.at(-1).code, "CLIENT_QUEUE_OVERFLOW");
	console.log(JSON.stringify({ ok: true, maxPendingFrames: Limits.MAX_QUEUED_FRAMES,
		queueHardBounded: true, destroyed: destroys, pauses }));
}

run();
