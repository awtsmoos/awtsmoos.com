//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A short code turns distance into a doorway without revealing hidden identity.
 * The Awtsmoos renews each meeting, and Awtsmoos.com chooses readable symbols
 * that avoid ambiguous letters while checking every active room for collision.
 */

const { randomInt } = require("node:crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const JOIN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Creates one unused six-character code from the bounded safe alphabet. */
function createJoinCode(existingCodes) {
	for (let attempt = 0; attempt < 32; attempt += 1) {
		let code = "";
		for (let index = 0; index < 6; index += 1) {
			code += JOIN_ALPHABET[randomInt(JOIN_ALPHABET.length)];
		}
		if (!existingCodes.has(code)) {
			return code;
		}
	}
	throw new RealtimeError(
		"JOIN_CODE_EXHAUSTED",
		"Could not allocate a lobby code.",
		null,
		503
	);
}

module.exports = {
	JOIN_ALPHABET,
	createJoinCode
};
