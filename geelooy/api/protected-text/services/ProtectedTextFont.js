// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @module ProtectedTextFont
 * @description
 * Builds one fresh scrambled font per session for the protected-text demo.
 * A random permutation is drawn for each session and the base font's cmap is
 * rewritten so codepoint c draws the glyph that used to belong to PI(c).
 * The server then pre-permutes the text with the inverse permutation, so
 * permuted text + permuted font renders exactly the original text.
 *
 * Honest scope: this layer does NOT protect the pixels. The pixels must be
 * correct for the reader, so a screenshot is still readable — that is the
 * floor. What it does is put a second lock on the decrypted string: if the
 * plaintext string somehow leaks (memory dump, debugger), it is permuted
 * garbage without that session's font table, and the font table is
 * single-use per session and never shipped in the clear.
 *
 * Bidi rule (paid for by reasoning, verified by test): Hebrew letters are
 * permuted ONLY among Hebrew letters and Latin ONLY among Latin. A shared
 * permutation would put Latin letters inside the Hebrew string, and the
 * bidi algorithm would reorder the canvas output — adjacent Latin letters
 * in RTL text get flipped relative to the original order. Script-preserving
 * permutations keep bidi identical to the original text.
 */

const fs = require("node:fs");
const crypto = require("node:crypto");
const opentype = require("../vendor/opentype.js");

// Hebrew letters, finals included; Latin upper + lower. Vowels, punctuation,
// spaces and digits are NOT permuted — they pass through unchanged.
const HEBREW_CODEPOINTS = [
	0x05d0, 0x05d1, 0x05d2, 0x05d3, 0x05d4, 0x05d5, 0x05d6, 0x05d7, 0x05d8,
	0x05d9, 0x05da, 0x05db, 0x05dc, 0x05dd, 0x05de, 0x05df, 0x05e0, 0x05e1,
	0x05e2, 0x05e3, 0x05e4, 0x05e5, 0x05e6, 0x05e7, 0x05e8, 0x05e9, 0x05ea
];
const LATIN_CODEPOINTS = [];
for (let cp = 0x41; cp <= 0x5a; cp++) LATIN_CODEPOINTS.push(cp);
for (let cp = 0x61; cp <= 0x7a; cp++) LATIN_CODEPOINTS.push(cp);

/**
 * Draws one fresh random permutation of a codepoint set (Fisher-Yates,
 * crypto randomness). Returns a Map from codepoint to its image.
 *
 * @param {number[]} set Codepoints to permute.
 * @returns {Map<number, number>} Permutation map.
 */
function randomPermutation(set) {
	const shuffled = [...set];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = crypto.randomInt(i + 1);
		const tmp = shuffled[i];
		shuffled[i] = shuffled[j];
		shuffled[j] = tmp;
	}
	return new Map(set.map((cp, i) => [cp, shuffled[i]]));
}

/**
 * Inverts a permutation map.
 *
 * @param {Map<number, number>} perm Permutation map.
 * @returns {Map<number, number>} Inverse map.
 */
function invertPermutation(perm) {
	return new Map([...perm.entries()].map(([k, v]) => [v, k]));
}

/**
 * Loads the base font bytes once. Throws when the file is missing or unreadable;
 * the service catches that and runs the demo without the font layer.
 *
 * @param {string} fontPath Absolute path to the base TTF.
 * @returns {Buffer} Base font bytes.
 */
function loadBaseFont(fontPath) {
	return fs.readFileSync(fontPath);
}

/**
 * Builds one permuted font from the base font bytes plus the inverse text
 * permutation to apply to the sample text before encryption.
 *
 * The cmap rewrite works on glyph unicodes (opentype.js rebuilds the cmap
 * table from each glyph's `unicodes` array when serializing — editing the
 * parsed `glyphIndexMap` alone does NOT survive a write). A glyph whose
 * unicode is u now carries unicode PIinv(u), so cmap_new(c) is the glyph
 * that used to belong to PI(c).
 *
 * @param {Buffer} baseBuffer Base TTF bytes.
 * @returns {{fontBytes: Buffer, permuteText: (string) => string}}
 * 	Permuted font bytes and the inverse-permutation text function.
 */
function createPermutedFont(baseBuffer) {
	const piHebrew = randomPermutation(HEBREW_CODEPOINTS);
	const piLatin = randomPermutation(LATIN_CODEPOINTS);
	const pi = new Map([...piHebrew, ...piLatin]);
	const piInv = invertPermutation(pi);

	const font = opentype.parse(baseBuffer);
	for (let i = 0; i < font.glyphs.length; i++) {
		const glyph = font.glyphs.get(i);
		const next = glyph.unicodes.map(u => (piInv.has(u) ? piInv.get(u) : u));
		glyph.unicodes = next;
		glyph.unicode = next[0];
	}
	const fontBytes = Buffer.from(font.toArrayBuffer());

	/**
	 * Pre-permutes text with the inverse permutation: the client draws the
	 * result with the permuted font and the screen shows the original.
	 *
	 * @param {string} text Original text.
	 * @returns {string} Permuted text.
	 */
	function permuteText(text) {
		return [...text].map(ch => {
			const cp = ch.codePointAt(0);
			return piInv.has(cp) ? String.fromCodePoint(piInv.get(cp)) : ch;
		}).join("");
	}

	return { fontBytes, permuteText };
}

module.exports = {
	HEBREW_CODEPOINTS,
	LATIN_CODEPOINTS,
	randomPermutation,
	invertPermutation,
	loadBaseFont,
	createPermutedFont
};
