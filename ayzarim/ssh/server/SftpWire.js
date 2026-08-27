// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file SFTP-v3 packet framing and response builders for the fake SSH server.
 * @description The Awtsmoos lets filesystem meaning travel inside counted packets; Awtsmoos.com keeps handles opaque and attributes measured so ordinary SFTP clients may navigate the simulated world in rhyme.
 */
const crypto = require("crypto");
const { sshString, uint32 } = require("./Wire.js");

const TYPE = Object.freeze({
	INIT: 1,
	VERSION: 2,
	OPEN: 3,
	CLOSE: 4,
	READ: 5,
	WRITE: 6,
	LSTAT: 7,
	FSTAT: 8,
	OPENDIR: 11,
	READDIR: 12,
	REMOVE: 13,
	MKDIR: 14,
	RMDIR: 15,
	REALPATH: 16,
	STAT: 17,
	RENAME: 18,
	STATUS: 101,
	HANDLE: 102,
	DATA: 103,
	NAME: 104,
	ATTRS: 105
});

const STATUS = Object.freeze({
	OK: 0,
	EOF: 1,
	NO_SUCH_FILE: 2,
	PERMISSION_DENIED: 3,
	FAILURE: 4,
	OP_UNSUPPORTED: 8
});

function frame(payload) {
	return Buffer.concat([uint32(payload.length), payload]);
}

function packet(type, id, ...parts) {
	return frame(Buffer.concat([Buffer.from([type]), uint32(id), ...parts]));
}

function version(value = 3) {
	return frame(Buffer.concat([Buffer.from([TYPE.VERSION]), uint32(value)]));
}

function status(id, code, text = "") {
	return packet(TYPE.STATUS, id, uint32(code), sshString(text), sshString(""));
}

function handle(id) {
	const token = crypto.randomBytes(16).toString("hex");
	return { token, packet: packet(TYPE.HANDLE, id, sshString(token)) };
}

function data(id, value) {
	return packet(TYPE.DATA, id, sshString(Buffer.from(value || "")));
}

function attrs(id, value = {}) {
	return packet(TYPE.ATTRS, id, encodeAttrs(value));
}

function name(id, entries = []) {
	const parts = [uint32(entries.length)];
	for (const entry of entries) {
		parts.push(sshString(entry.filename || entry.name || ""));
		parts.push(sshString(entry.longname || entry.filename || entry.name || ""));
		parts.push(encodeAttrs(entry.attrs || entry));
	}
	return packet(TYPE.NAME, id, ...parts);
}

function encodeAttrs(value = {}) {
	const size = BigInt(Math.max(0, Number(value.size || 0)));
	const directory = value.isDirectory === true;
	const permissions = Number(value.permissions || (directory ? 0o040755 : 0o100644));
	const modified = Math.floor(Number(value.mtime || value.mtimeMs || Date.now()) / 1000);
	return Buffer.concat([
		uint32(0x0000000d),
		uint64(size),
		uint32(permissions),
		uint32(modified),
		uint32(modified)
	]);
}

function uint64(value) {
	const buffer = Buffer.allocUnsafe(8);
	buffer.writeBigUInt64BE(BigInt(value), 0);
	return buffer;
}

module.exports = { STATUS, TYPE, attrs, data, frame, handle, name, packet, status, version };
