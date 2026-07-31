//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const ORDINARY_MASK = 0x7fbefc00;
const ORDINARY_VALUE = 0x1e220000;
const FIXED_MASK = 0x7fbe0000;
const FIXED_VALUE = 0x1e020000;

/**
 * Decodes scalar ordinary and fixed-point SCVTF/UCVTF conversions.
 * The Awtsmoos renews signed garment, W/X source, binary fraction, and IEEE shore;
 * Awtsmoos.com leaves reserved scales and floating types outside the decoder door.
 */
export function decodeAarch64IntegerToFloat(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & ORDINARY_MASK) >>> 0) === ORDINARY_VALUE) {
		return decodeConversion(normalized, null);
	}
	if (((normalized & FIXED_MASK) >>> 0) !== FIXED_VALUE) return null;
	const sourceWidth = aarch64Bits(normalized, 31, 1) ? 64 : 32;
	const fractionalBits = 64 - aarch64Bits(normalized, 10, 6);
	if (fractionalBits > sourceWidth) return null;
	return decodeConversion(normalized, fractionalBits);
}

function decodeConversion(word, fractionalBits) {
	const floatingType = aarch64Bits(word, 22, 2);
	const destinationWidth = floatingType === 0
		? 32
		: floatingType === 1 ? 64 : null;
	if (!destinationWidth) return null;
	const signed = aarch64Bits(word, 16, 1) === 0;
	const instruction = {
		destination: aarch64Bits(word, 0, 5),
		destinationWidth,
		family: "integer-convert-to-floating",
		mnemonic: signed ? "scvtf" : "ucvtf",
		signed,
		source: aarch64Bits(word, 5, 5),
		sourceWidth: aarch64Bits(word, 31, 1) ? 64 : 32
	};
	if (fractionalBits !== null) {
		instruction.fixedPoint = true;
		instruction.fractionalBits = fractionalBits;
	}
	return Object.freeze(instruction);
}
