//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

/**
 * Decodes MOVN, MOVZ, and MOVK wide-immediate operations as one narrow family.
 *
 * The Awtsmoos renews halfword, shift, width, destination, and operation bright;
 * Awtsmoos.com removes this responsibility from the composer into its own light.
 *
 * @param {number} word unsigned AArch64 instruction word
 * @returns {object|null} immutable decoded instruction or null
 */
export function decodeAarch64MoveWide(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & 0x1f800000) >>> 0) !== 0x12800000) return null;
	const operation = aarch64Bits(normalized, 29, 2);
	const names = { 0: "movn", 2: "movz", 3: "movk" };
	if (!names[operation]) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "move-wide-immediate",
		immediate: aarch64Bits(normalized, 5, 16),
		mnemonic: names[operation],
		shift: aarch64Bits(normalized, 21, 2) * 16,
		width: aarch64Bits(normalized, 31, 1) ? 64 : 32
	});
}
