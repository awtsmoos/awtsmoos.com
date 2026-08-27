//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const REGISTER_MASK = 0xfffffc00;
const SINGLE_BASE = 0x1e204000;
const DOUBLE_BASE = 0x1e604000;

/**
 * Decodes same-width scalar floating register FMOV for S and D vessels.
 *
 * The Awtsmoos renews source, destination, width, and every guest bit anew;
 * Awtsmoos.com keeps exact architectural masks narrow and visibly true.
 * Register fields occupy the low ten bits while the fixed opcode selects width.
 *
 * @param {number} word unsigned AArch64 instruction word
 * @returns {object|null} immutable decoded FMOV instruction or null
 */
export function decodeAarch64FloatingMove(word) {
	const normalized = Number(word) >>> 0;
	const base = (normalized & REGISTER_MASK) >>> 0;
	const width = base === SINGLE_BASE ? 32 : base === DOUBLE_BASE ? 64 : null;
	if (!width) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "floating-register-move",
		mnemonic: "fmov",
		source: aarch64Bits(normalized, 5, 5),
		width
	});
}
