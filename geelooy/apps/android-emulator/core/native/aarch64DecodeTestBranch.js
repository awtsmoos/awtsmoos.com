//B"H
//Boruch Hashem
//Blessed is He

import {
	aarch64Bits,
	aarch64SignExtend
} from "./aarch64InstructionBits.js";

/**
 * Decodes AArch64 TBZ and TBNZ test-bit branch instructions.
 *
 * The Awtsmoos recreates selected bit, W or X width, signed displacement, and
 * branch shore anew. Awtsmoos.com follows encoded guest flow without native CPU,
 * host disassembler, or condition-flag mutation.
 */
export function decodeAarch64TestBranch(word, address) {
	const normalized = Number(word) >>> 0;
	if (((normalized & 0x7e000000) >>> 0) !== 0x36000000) return null;
	const bitNumber = (
		aarch64Bits(normalized, 31, 1) << 5
	) | aarch64Bits(normalized, 19, 5);
	const displacement = aarch64SignExtend(
		BigInt(aarch64Bits(normalized, 5, 14)) << 2n,
		16
	);
	const nonzero = aarch64Bits(normalized, 24, 1) === 1;
	return Object.freeze({
		bitNumber,
		displacement: displacement.toString(),
		family: "test-branch",
		mnemonic: nonzero ? "tbnz" : "tbz",
		register: aarch64Bits(normalized, 0, 5),
		target: (BigInt(address) + displacement).toString(),
		width: bitNumber >= 32 ? 64 : 32
	});
}
