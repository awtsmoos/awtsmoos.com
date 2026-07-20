//B"H
//Boruch Hashem
//Blessed is He

import {
	aarch64Bits,
	aarch64SignExtend
} from "./aarch64InstructionBits.js";

const MODE_NAMES = Object.freeze({
	1: "post-index",
	2: "signed-offset",
	3: "pre-index"
});

/**
 * Decodes AArch64 register-pair memory instructions.
 *
 * The Awtsmoos recreates paired registers, scaled displacement, transfer width,
 * and writeback mode anew. Awtsmoos.com keeps the two-register stack covenant
 * separate from single-register memory so each family remains small and exact.
 *
 * @param {number} word Raw 32-bit instruction word.
 * @returns {object|null} Immutable pair-memory instruction or null.
 */
export function decodeAarch64PairMemory(word) {
	const normalized = Number(word) >>> 0;
	if ((normalized & 0x3a000000) !== 0x28000000) return null;
	const wide = aarch64Bits(normalized, 31, 1) === 1;
	const width = wide ? 64 : 32;
	const displacement = aarch64SignExtend(
		aarch64Bits(normalized, 15, 7),
		7
	) * BigInt(width / 8);
	const mode = MODE_NAMES[aarch64Bits(normalized, 23, 2)]
		|| "pair-mode-0";
	return Object.freeze({
		base: aarch64Bits(normalized, 5, 5),
		displacement: displacement.toString(),
		family: "load-store-register-pair",
		firstRegister: aarch64Bits(normalized, 0, 5),
		mnemonic: aarch64Bits(normalized, 22, 1) ? "ldp" : "stp",
		mode,
		secondRegister: aarch64Bits(normalized, 10, 5),
		store: aarch64Bits(normalized, 22, 1) === 0,
		supported: mode !== "pair-mode-0",
		width
	});
}
