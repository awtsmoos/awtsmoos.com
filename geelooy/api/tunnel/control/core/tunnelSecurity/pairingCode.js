//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const crypto = require("node:crypto");

/**
 * @file Human-readable pairing codes without confusable glyphs.
 * @description 31 symbols and ten cryptographically independent draws
 * provide nearly 50 bits, while excluding 0/O and 1/I/L confusion on phone screens.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function createCode() {
	let code = "";
	for (let index = 0; index < 10; index += 1) {
		code += ALPHABET[crypto.randomInt(ALPHABET.length)];
	}
	return code;
}

function normalizedCode(value) {
	return String(value || "").replace(/\s|-/g, "").toUpperCase();
}

module.exports = { ALPHABET, createCode, normalizedCode };
