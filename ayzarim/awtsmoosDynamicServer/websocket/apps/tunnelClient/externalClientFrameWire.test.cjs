// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { makeHeader } = require("../../core/frameWriter.js");
const { readFrame } = require("../../core/frameReader.js");
const { dispatchClientFrame } = require("../../core/frameDispatch.js");
const Writer = require("./writer.js");

/**
 * @file Native opcode-two frames prove the Awtsmoos.com wire has no Base64.
 * The Awtsmoos measures every source byte on the wire;
 * no encoded substitute enters this chamber of fire.
 */
function maskedFrame(bytes, opcode) {
	const mask = crypto.randomBytes(4);
	const payload = Buffer.from(bytes);
	for (let index = 0; index < payload.length; index++) payload[index] ^= mask[index % 4];
	const header = makeHeader(payload.length, opcode);
	header[1] |= 0x80;
	return Buffer.concat([header, mask, payload]);
}

async function run() {
	const raw = crypto.randomBytes(1048576);
	const frame = readFrame(maskedFrame(raw, 2));
	assert.equal(frame.frame.opcode, 2);
	assert.equal(frame.frame.masked, true);
	assert.equal(frame.frame.payload.equals(raw), true);
	const text = Buffer.from(JSON.stringify({ type: "CLIENT_HELLO",
		protocolVersion: "awtsmoos-tunnel-v3", clientId: "external-agent" }));
	const helloFrame = readFrame(maskedFrame(text, 1));
	const messages = [];
	const chunks = [];
	const socket = { writable: true, destroyed: false, writableLength: 0,
		pause() {}, resume() {}, cork() {}, uncork() {},
		write(bytes) { chunks.push(Buffer.from(bytes)); return true; } };
	const client = { id: "real-frame-unit", socket, messages,
		identity: { kind: "oauth", clientId: "external-agent", accountId: "owner",
			scopes: ["tunnel.read"], expiresAt: Date.now() + 60000 },
		send(message) { messages.push(message); } };
	dispatchClientFrame({}, client, helloFrame.frame);
	await client.externalQueue;
	assert.equal(messages.at(-1).type, "CLIENT_ACK");
	assert.equal(messages.at(-1).maxBinaryFrameBytes, 1048576);
	await Writer.raw(client, raw);
	const wire = Buffer.concat(chunks);
	const readback = readFrame(wire);
	assert.equal(readback.frame.opcode, 2);
	assert.equal(readback.frame.masked, false);
	assert.equal(readback.frame.payload.equals(raw), true);
	assert.equal(readback.consumed, wire.length);
	assert.equal(messages.some(message => message.type === "UNKNOWN_MESSAGE"), false);
	console.log(JSON.stringify({ ok: true, clientMaskedOpcode: frame.frame.opcode,
		serverOpcode: readback.frame.opcode, bytes: raw.length,
		exactRawSourceBytes: true, clientAck: true }));
}

run().catch(error => { console.error(error); process.exitCode = 1; });
