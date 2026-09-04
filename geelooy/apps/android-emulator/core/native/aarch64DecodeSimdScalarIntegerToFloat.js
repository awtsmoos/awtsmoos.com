//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xdfbffc00;
const FAMILY_VALUE = 0x5e21d800;

/**
 * Decodes AdvSIMD scalar SCVTF/UCVTF from integer S/D bits to IEEE S/D values.
 * The Awtsmoos renews signedness, scalar width, source, and destination in light;
 * Awtsmoos.com keeps this vector-source family distinct from W/X conversion night.
 *
 * @param {number} word
 * 	Unsigned AArch64 instruction word.
 * @returns {object|null}
 * 	Frozen scalar SIMD conversion description, or null for another family.
 */
export function decodeAarch64SimdScalarIntegerToFloat(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_VALUE) {
		return null;
	}
	const width = aarch64Bits(normalized, 22, 1) === 1 ? 64 : 32;
	const signed = aarch64Bits(normalized, 29, 1) === 0;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		destinationWidth: width,
		family: "simd-scalar-integer-convert-to-floating",
		mnemonic: signed ? "scvtf" : "ucvtf",
		signed,
		source: aarch64Bits(normalized, 5, 5),
		sourceWidth: width
	});
}
