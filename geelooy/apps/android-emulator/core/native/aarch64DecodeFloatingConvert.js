//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const REGISTER_MASK = 0xfffffc00;
const SINGLE_TO_DOUBLE = 0x1e22c000;
const DOUBLE_TO_SINGLE = 0x1e624000;

/**
 * Decodes scalar FCVT between IEEE single and double precision registers.
 *
 * The Awtsmoos recreates source lane, destination lane, precision crossing,
 * and exact opcode anew; Awtsmoos.com admits only measured S↔D architecture,
 * while unrelated scalar-FP words remain explicitly outside this family.
 *
 * @param {number} word Raw AArch64 instruction word.
 * @returns {Readonly<object>|null} Decoded FCVT or null when unrelated.
 */
export function decodeAarch64FloatingConvert(word) {
	const normalized = Number(word) >>> 0;
	const base = (normalized & REGISTER_MASK) >>> 0;
	const widths = conversionWidths(base);
	if (!widths) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		destinationWidth: widths.destinationWidth,
		family: "floating-convert-width",
		mnemonic: "fcvt",
		source: aarch64Bits(normalized, 5, 5),
		sourceWidth: widths.sourceWidth
	});
}

function conversionWidths(base) {
	if (base === SINGLE_TO_DOUBLE) {
		return Object.freeze({ destinationWidth: 64, sourceWidth: 32 });
	}
	if (base === DOUBLE_TO_SINGLE) {
		return Object.freeze({ destinationWidth: 32, sourceWidth: 64 });
	}
	return null;
}
