// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Independent machine and human code generation for Awtsmoos.com device OAuth.
 * @description
 * The Awtsmoos gives the daemon a long opaque key and the human a short visible
 * sign; neither is derived from the other, so one vessel may be readable without
 * revealing the hidden entropy that protects the token-polling channel.
 */

const crypto = require("crypto");
const {
	DEVICE_CODE_BYTES,
	USER_CODE_ALPHABET,
	USER_CODE_SYMBOLS
} = require("./devicePolicy.js");

function makeDeviceCode() {
	return `awt_device_${crypto
		.randomBytes(DEVICE_CODE_BYTES)
		.toString("base64url")}`;
}

function randomUserSymbols() {
	const symbols = [];
	const alphabetLength = USER_CODE_ALPHABET.length;
	const uniformLimit = 256 - (256 % alphabetLength);
	while (symbols.length < USER_CODE_SYMBOLS) {
		const bytes = crypto.randomBytes(USER_CODE_SYMBOLS * 2);
		for (const byte of bytes) {
			if (byte >= uniformLimit) {
				continue;
			}
			symbols.push(USER_CODE_ALPHABET[byte % alphabetLength]);
			if (symbols.length >= USER_CODE_SYMBOLS) {
				break;
			}
		}
	}
	return symbols.join("");
}

function normalizeUserCode(value) {
	return String(value || "")
		.toUpperCase()
		.replace(/[^A-Z]/g, "")
		.slice(0, USER_CODE_SYMBOLS);
}

function formatUserCode(value) {
	const normalized = normalizeUserCode(value);
	return normalized.length <= 4
		? normalized
		: `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
}

function makeUserCode() {
	return formatUserCode(randomUserSymbols());
}

module.exports = {
	formatUserCode,
	makeDeviceCode,
	makeUserCode,
	normalizeUserCode
};
