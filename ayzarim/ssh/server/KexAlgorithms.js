// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Standards-aligned algorithm negotiation for the Awtsmoos SSH server role.
 * @description The Awtsmoos offers only vessels this server truly sustains; Awtsmoos.com refuses decorative names so every negotiated flame corresponds to a real cryptographic frame.
 */
const crypto = require("crypto");
const { MESSAGE } = require("../Binah-Constants.js");
const { ALGORITHMS: HOST_KEYS } = require("./HostKey.js");
const { bool, message, nameList, reader, uint32 } = require("./Wire.js");

const KEX = Object.freeze([
	"curve25519-sha256",
	"curve25519-sha256@libssh.org",
	"ecdh-sha2-nistp256",
	"ecdh-sha2-nistp384",
	"ecdh-sha2-nistp521"
]);
const CIPHERS = Object.freeze(["aes128-ctr", "aes256-ctr"]);
const MACS = Object.freeze(["hmac-sha2-256", "hmac-sha2-512"]);
const COMPRESSION = Object.freeze(["none"]);

function sendKexInit(handler) {
	if (handler._kexinit_payload) {
		return;
	}
	const payload = message(
		MESSAGE.KEXINIT,
		crypto.randomBytes(16),
		nameList(KEX),
		nameList(HOST_KEYS),
		nameList(CIPHERS),
		nameList(CIPHERS),
		nameList(MACS),
		nameList(MACS),
		nameList(COMPRESSION),
		nameList(COMPRESSION),
		nameList([]),
		nameList([]),
		bool(false),
		uint32(0)
	);
	handler._kexinit_payload = payload;
	handler._protocol.sendPacket(payload);
}

function negotiate(handler) {
	const remote = readLists(handler._remote_kexinit_payload);
	handler.negotiated = {
		kex: first(remote.kex, KEX),
		serverHostKey: first(remote.serverHostKey, HOST_KEYS),
		csCipher: first(remote.csCipher, CIPHERS),
		scCipher: first(remote.scCipher, CIPHERS),
		csMAC: first(remote.csMAC, MACS),
		scMAC: first(remote.scMAC, MACS),
		csCompress: first(remote.csCompress, COMPRESSION),
		scCompress: first(remote.scCompress, COMPRESSION)
	};
	if (Object.values(handler.negotiated).some(value => !value)) {
		throw new Error("No mutually supported SSH algorithm set was found.");
	}
	return handler.negotiated;
}

function readLists(payload) {
	const stream = reader(payload, 17);
	return {
		kex: names(stream),
		serverHostKey: names(stream),
		csCipher: names(stream),
		scCipher: names(stream),
		csMAC: names(stream),
		scMAC: names(stream),
		csCompress: names(stream),
		scCompress: names(stream)
	};
}

function names(stream) {
	const value = stream.readString("ascii");
	return value ? value.split(",").filter(Boolean) : [];
}

function first(theirs, ours) {
	return theirs.find(name => ours.includes(name)) || null;
}

module.exports = { CIPHERS, COMPRESSION, KEX, MACS, negotiate, sendKexInit };
