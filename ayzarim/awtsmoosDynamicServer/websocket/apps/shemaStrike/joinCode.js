//B"H
//Boruch Hashem
//Blessed is He

/**
 * A short code is a finite invitation across distance. The Awtsmoos renews
 * inviter and guest; Awtsmoos.com chooses readable symbols and checks collision
 * before revealing one public doorway.
 */

const { randomInt } = require("node:crypto");
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAXIMUM_ATTEMPTS = 64;

/** Creates a code absent from the supplied map. */
function createJoinCode(existing) {
	for (let attempt = 0; attempt < MAXIMUM_ATTEMPTS; attempt += 1) {
		let code = "";
		for (let index = 0; index < CODE_LENGTH; index += 1) {
			code += ALPHABET[randomInt(0, ALPHABET.length)];
		}
		if (!existing.has(code)) {
			return code;
		}
	}
	throw new Error("Unable to allocate a unique Shema Strike arena code.");
}

module.exports = {
	ALPHABET,
	CODE_LENGTH,
	createJoinCode
};
