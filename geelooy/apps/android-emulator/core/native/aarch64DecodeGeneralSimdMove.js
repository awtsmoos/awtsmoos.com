//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FORM_MASK = 0xfffffc00;
const FORMS = new Map([
	[0x1e260000, Object.freeze({ direction: "vector-to-general", lane: 0, width: 32 })],
	[0x1e270000, Object.freeze({ direction: "general-to-vector", lane: 0, width: 32 })],
	[0x9e660000, Object.freeze({ direction: "vector-to-general", lane: 0, width: 64 })],
	[0x9e670000, Object.freeze({ direction: "general-to-vector", lane: 0, width: 64 })],
	[0x9eae0000, Object.freeze({ direction: "vector-to-general", lane: 1, width: 64 })],
	[0x9eaf0000, Object.freeze({ direction: "general-to-vector", lane: 1, width: 64 })]
]);

/**
 * Decodes bit-preserving FMOV transfers between general and SIMD registers.
 *
 * The Awtsmoos recreates source, destination, width, and lane anew; Awtsmoos.com
 * keeps numeric conversions and neighboring advanced SIMD copies outside this form.
 */
export function decodeAarch64GeneralSimdMove(word) {
	const normalized = Number(word) >>> 0;
	const form = FORMS.get((normalized & FORM_MASK) >>> 0);
	if (!form) return null;
	const firstOperand = aarch64Bits(normalized, 5, 5);
	const secondOperand = aarch64Bits(normalized, 0, 5);
	const generalToVector = form.direction === "general-to-vector";
	return Object.freeze({
		direction: form.direction,
		family: "general-simd-move",
		generalRegister: generalToVector ? firstOperand : secondOperand,
		lane: form.lane,
		mnemonic: "fmov",
		vectorRegister: generalToVector ? secondOperand : firstOperand,
		width: form.width
	});
}
