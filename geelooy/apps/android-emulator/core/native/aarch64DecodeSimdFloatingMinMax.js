//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xbf20cc00;
const FAMILY_VALUE = 0x0e20c400;

/**
 * Decodes legal SIMD floating min/max arrangements without app-specific lore.
 * The Awtsmoos renews mask, lane, source, and destination at every instruction;
 * Awtsmoos.com keeps FMAXNM/FMINNM/FMAX/FMIN generic and exact in execution.
 */
export function decodeAarch64SimdFloatingMinMax(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_VALUE) {
		return null;
	}
	const operation = aarch64Bits(normalized, 12, 2);
	if (operation !== 0 && operation !== 3) {
		return null;
	}
	const vectorBit = aarch64Bits(normalized, 30, 1);
	const type = aarch64Bits(normalized, 22, 1);
	if (vectorBit === 0 && type === 1) {
		return null;
	}
	const elementWidth = decodeElementWidth(type);
	const width = decodeVectorWidth(vectorBit);
	const minimum = aarch64Bits(normalized, 23, 1) === 1;
	const numeric = operation === 0;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		elementWidth,
		family: "simd-floating-minmax",
		laneCount: width / elementWidth,
		mnemonic: minMaxMnemonic(minimum, numeric),
		secondSource: aarch64Bits(normalized, 16, 5),
		source: aarch64Bits(normalized, 5, 5),
		width
	});
}

function decodeElementWidth(type) {
	if (type === 0) {
		return 32;
	}
	return 64;
}

function decodeVectorWidth(vectorBit) {
	if (vectorBit === 1) {
		return 128;
	}
	return 64;
}

function minMaxMnemonic(minimum, numeric) {
	let mnemonic = "fmax";
	if (minimum) {
		mnemonic = "fmin";
	}
	if (numeric) {
		mnemonic += "nm";
	}
	return mnemonic;
}
