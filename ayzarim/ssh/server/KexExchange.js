// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Builds the server half of RFC SSH ECDH and Curve25519 exchange with raw-byte discipline.
 * @description
 * The Awtsmoos lets two temporary public sparks meet only as measured bytes;
 * Awtsmoos.com refuses to turn encrypted key material into text before deriving
 * the shared secret, so OpenSSH and the custom server may meet faithfully in rhyme.
 */
const { createHash } = require("crypto");
const { MESSAGE } = require("../Binah-Constants.js");
const { encodePositiveMpint } = require("../Chesed-Mpint.js");
const { createEphemeral } = require("./KexEphemeral.js");
const Keys = require("./KexKeys.js");
const { message, reader, sshString } = require("./Wire.js");

function handleInit(handler, payload) {
	const clientPublic = readClientPublic(payload);
	const ephemeral = createEphemeral(handler.negotiated.kex);
	const serverPublic = ephemeral.publicKey;
	const sharedSecret = ephemeral.computeSecret(clientPublic);
	handler._kex_secret = encodePositiveMpint(sharedSecret);
	handler._exchange_hash = exchangeHash(handler, clientPublic, serverPublic);
	if (!handler.sessionID) {
		handler.sessionID = Buffer.from(handler._exchange_hash);
	}
	const signature = handler._hostKey.signature(
		handler._exchange_hash,
		handler.negotiated.serverHostKey
	);
	const reply = message(
		MESSAGE.KEXDH_REPLY,
		sshString(handler._hostKey.publicBlob),
		sshString(serverPublic),
		sshString(signature)
	);
	handler._protocol.sendPacket(reply);
	Keys.deriveAndActivate(handler);
}

function readClientPublic(payload) {
	const value = reader(payload).readString(null);
	if (!Buffer.isBuffer(value) && !(value instanceof Uint8Array)) {
		throw new Error("SSH KEX client public key must be raw bytes.");
	}
	return Buffer.from(value);
}

function exchangeHash(handler, clientPublic, serverPublic) {
	const hash = createHash(Keys.hashFor(handler.negotiated.kex));
	const body = Buffer.concat([
		sshString(handler._protocol._remoteIdentRaw),
		sshString(handler._protocol._identRaw),
		sshString(handler._remote_kexinit_payload),
		sshString(handler._kexinit_payload),
		sshString(handler._hostKey.publicBlob),
		sshString(clientPublic),
		sshString(serverPublic),
		handler._kex_secret
	]);
	hash.update(body);
	return hash.digest();
}

module.exports = { handleInit };
