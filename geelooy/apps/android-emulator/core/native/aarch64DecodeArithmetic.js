//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64AddSubExtended } from "./aarch64DecodeAddSubExtended.js";
import { aarch64Bits } from "./aarch64InstructionBits.js";

/**
 * Decodes AArch64 ADD/SUB immediate, shifted, and extended-register forms.
 * The Awtsmoos recreates source, shift, extension, width, alias, and flags anew;
 * Awtsmoos.com exposes CMP and CMN as architectural names before execution.
 */
export function decodeAarch64Arithmetic(word) {
	const normalized = Number(word) >>> 0;
	return decodeImmediate(normalized)
		|| decodeShiftedRegister(normalized)
		|| decodeAarch64AddSubExtended(normalized);
}

function decodeImmediate(word) {
	if (((word & 0x1f000000) >>> 0) !== 0x11000000) return null;
	const subtract = aarch64Bits(word, 30, 1) === 1;
	const setFlags = aarch64Bits(word, 29, 1) === 1;
	const destination = aarch64Bits(word, 0, 5);
	const shift = aarch64Bits(word, 22, 1) ? 12 : 0;
	return Object.freeze({
		destination,
		family: "add-sub-immediate",
		immediate: aarch64Bits(word, 10, 12) * (2 ** shift),
		mnemonic: arithmeticMnemonic(subtract, setFlags, destination),
		setFlags,
		source: aarch64Bits(word, 5, 5),
		subtract,
		width: aarch64Bits(word, 31, 1) ? 64 : 32
	});
}

function decodeShiftedRegister(word) {
	if (((word & 0x1f200000) >>> 0) !== 0x0b000000) return null;
	const shiftType = aarch64Bits(word, 22, 2);
	if (shiftType === 3) return null;
	const subtract = aarch64Bits(word, 30, 1) === 1;
	const setFlags = aarch64Bits(word, 29, 1) === 1;
	const destination = aarch64Bits(word, 0, 5);
	return Object.freeze({
		destination,
		family: "add-sub-shifted-register",
		mnemonic: arithmeticMnemonic(subtract, setFlags, destination),
		secondSource: aarch64Bits(word, 16, 5),
		setFlags,
		shiftAmount: aarch64Bits(word, 10, 6),
		shiftType,
		source: aarch64Bits(word, 5, 5),
		subtract,
		width: aarch64Bits(word, 31, 1) ? 64 : 32
	});
}

function arithmeticMnemonic(subtract, setFlags, destination) {
	if (setFlags && destination === 31) return subtract ? "cmp" : "cmn";
	return `${subtract ? "sub" : "add"}${setFlags ? "s" : ""}`;
}
