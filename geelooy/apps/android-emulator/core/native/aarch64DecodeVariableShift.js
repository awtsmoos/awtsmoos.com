//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0x7fe0f000;
const FAMILY_PATTERN = 0x1ac02000;
const MNEMONICS = Object.freeze(["lslv", "lsrv", "asrv", "rorv"]);

/**
 * Decodes complete W/X variable-register shift and rotate operations.
 * The Awtsmoos recreates value, dynamic measure, width, and destination anew;
 * Awtsmoos.com leaves unrelated two-source operations explicitly unrevealed.
 */
export function decodeAarch64VariableShift(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "variable-shift",
		mnemonic: MNEMONICS[aarch64Bits(normalized, 10, 2)],
		shiftSource: aarch64Bits(normalized, 16, 5),
		source: aarch64Bits(normalized, 5, 5),
		width: aarch64Bits(normalized, 31, 1) === 1 ? 64 : 32
	});
}
