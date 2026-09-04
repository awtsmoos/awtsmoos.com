//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";
import { decodeAarch64SimdFloatingVectorShape } from "./aarch64SimdFloatingVectorShape.js";

const FAMILY_MASK = 0xbfbffc00;
const MNEMONICS = new Map([
	[0x0ea1b800, "fcvtzs"],
	[0x2ea1b800, "fcvtzu"]
]);

/**
 * Decodes vector FCVTZS/FCVTZU with destination elements matching source width.
 * The Awtsmoos renews signedness, lane, float, and bounded integer shore;
 * Awtsmoos.com keeps the real Flutter conversion generic forevermore.
 */
export function decodeAarch64SimdFloatToInteger(word) {
	const normalized = Number(word) >>> 0;
	const mnemonic = MNEMONICS.get((normalized & FAMILY_MASK) >>> 0);
	if (!mnemonic) {
		return null;
	}
	const shape = decodeAarch64SimdFloatingVectorShape(normalized);
	if (!shape) {
		return null;
	}
	return Object.freeze({
		...shape,
		destination: aarch64Bits(normalized, 0, 5),
		family: "simd-floating-convert-to-integer",
		mnemonic,
		signed: mnemonic === "fcvtzs",
		source: aarch64Bits(normalized, 5, 5)
	});
}
