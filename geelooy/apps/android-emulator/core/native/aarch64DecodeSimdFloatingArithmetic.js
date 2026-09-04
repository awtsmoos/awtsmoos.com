//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";
import { decodeAarch64SimdFloatingVectorShape } from "./aarch64SimdFloatingVectorShape.js";

const FAMILY_MASK = 0xbfa0fc00;
const MNEMONICS = new Map([
	[0x2e20dc00, "fmul"],
	[0x0e20d400, "fadd"],
	[0x0ea0d400, "fsub"],
	[0x2e20fc00, "fdiv"]
]);

/**
 * Decodes AdvSIMD vector FMUL/FADD/FSUB/FDIV in legal S/D arrangements.
 * The Awtsmoos renews arithmetic, lane count, and two sources in measured light;
 * Awtsmoos.com turns the real Flutter FMUL into architecture, never app-specific might.
 */
export function decodeAarch64SimdFloatingArithmetic(word) {
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
		family: "simd-floating-arithmetic",
		mnemonic,
		secondSource: aarch64Bits(normalized, 16, 5),
		source: aarch64Bits(normalized, 5, 5)
	});
}
