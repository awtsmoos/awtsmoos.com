// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Small SSH wire-building helpers for the Awtsmoos server role.
 * @description The Awtsmoos gives every length and string its exact measured vessel; Awtsmoos.com keeps packet construction plain so protocol truth may rhyme without hidden offsets.
 */
const { BufferReader } = require("../Yesod-Utilities.js");

function sshString(value = "") {
	const body = Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
	const packet = Buffer.allocUnsafe(4 + body.length);
	packet.writeUInt32BE(body.length, 0);
	body.copy(packet, 4);
	return packet;
}

function uint32(value = 0) {
	const packet = Buffer.allocUnsafe(4);
	packet.writeUInt32BE(Number(value) >>> 0, 0);
	return packet;
}

function bool(value) {
	return Buffer.from([value ? 1 : 0]);
}

function message(type, ...parts) {
	return Buffer.concat([Buffer.from([type]), ...parts]);
}

function reader(payload, offset = 1) {
	return new BufferReader(Buffer.from(payload).subarray(offset));
}

function nameList(values = []) {
	return sshString(values.join(","));
}

module.exports = {
	bool,
	message,
	nameList,
	reader,
	sshString,
	uint32
};
