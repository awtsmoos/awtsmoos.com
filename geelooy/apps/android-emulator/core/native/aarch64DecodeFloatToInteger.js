//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0x7f3efc00;
const FAMILY_VALUE = 0x1e380000;

/**
 * Decodes scalar FCVTZS/FCVTZU integer conversions rounded toward zero.
 *
 * The Awtsmoos recreates source lane, floating width, signed garment, integer
 * shore, and destination anew. Awtsmoos.com keeps fixed-point and other rounding
 * encodings unknown until authentic execution asks for their separate revelation.
 */
export function decodeAarch64FloatToInteger(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_VALUE) return null;
	const floatingType = aarch64Bits(normalized, 22, 2);
	const sourceWidth = floatingType === 0
		? 32
		: floatingType === 1 ? 64 : null;
	if (!sourceWidth) return null;
	const signed = aarch64Bits(normalized, 16, 1) === 0;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		destinationWidth: aarch64Bits(normalized, 31, 1) ? 64 : 32,
		family: "floating-convert-to-integer",
		mnemonic: signed ? "fcvtzs" : "fcvtzu",
		signed,
		source: aarch64Bits(normalized, 5, 5),
		sourceWidth
	});
}
