// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Stable RSA host identity for the custom Awtsmoos SSH server.
 * @description The Awtsmoos gives the simulated computer a persistent face; Awtsmoos.com keeps its private root outside the project while clients may remember one truthful host-key trace.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { encodePositiveMpint } = require("../Chesed-Mpint.js");
const { sshString } = require("./Wire.js");

const ALGORITHMS = Object.freeze(["rsa-sha2-512", "rsa-sha2-256", "ssh-rsa"]);

function loadHostKey(config = {}) {
	const keyPath = config.fakeSshHostKeyPath || defaultKeyPath();
	ensureKey(keyPath);
	const privateKey = crypto.createPrivateKey(fs.readFileSync(keyPath));
	return {
		algorithms: ALGORITHMS,
		keyPath,
		privateKey,
		publicBlob: publicBlob(privateKey),
		signature(exchangeHash, algorithm) {
			return signatureBlob(privateKey, exchangeHash, algorithm);
		}
	};
}

function ensureKey(keyPath) {
	if (fs.existsSync(keyPath)) {
		return;
	}
	fs.mkdirSync(path.dirname(keyPath), { recursive: true, mode: 0o700 });
	const pair = crypto.generateKeyPairSync("rsa", {
		modulusLength: 3072,
		publicExponent: 0x10001
	});
	const pem = pair.privateKey.export({ type: "pkcs8", format: "pem" });
	fs.writeFileSync(keyPath, pem, { mode: 0o600, flag: "wx" });
}

function defaultKeyPath() {
	return path.join(os.homedir(), ".awtsmoos", "fake-ssh", "host-key-rsa.pem");
}

function publicBlob(privateKey) {
	const jwk = crypto.createPublicKey(privateKey).export({ format: "jwk" });
	const exponent = base64url(jwk.e);
	const modulus = base64url(jwk.n);
	return Buffer.concat([
		sshString("ssh-rsa"),
		encodePositiveMpint(exponent),
		encodePositiveMpint(modulus)
	]);
}

function signatureBlob(privateKey, exchangeHash, algorithm) {
	if (!ALGORITHMS.includes(algorithm)) {
		throw new Error(`Unsupported host signature algorithm: ${algorithm}`);
	}
	const hash = algorithm === "rsa-sha2-512"
		? "sha512"
		: algorithm === "rsa-sha2-256" ? "sha256" : "sha1";
	const signature = crypto.sign(hash, exchangeHash, privateKey);
	return Buffer.concat([sshString(algorithm), sshString(signature)]);
}

function base64url(value = "") {
	return Buffer.from(String(value), "base64url");
}

module.exports = {
	ALGORITHMS,
	loadHostKey
};
