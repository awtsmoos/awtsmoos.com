//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const MULTIPLY_ADD_MASK = 0x7fe08000;
const MULTIPLY_ADD = 0x1b000000;
const MULTIPLY_SUBTRACT = 0x1b008000;
const MULTIPLY_LONG_MASK = 0xffe00000;
const SIGNED_MULTIPLY_LONG = 0x9b200000;
const UNSIGNED_MULTIPLY_LONG = 0x9ba00000;
const MULTIPLY_HIGH_MASK = 0xffe0fc00;
const SIGNED_MULTIPLY_HIGH = 0x9b407c00;
const UNSIGNED_MULTIPLY_HIGH = 0x9bc07c00;

/**
 * Decodes measured AArch64 three-source and high-half multiply families.
 * The Awtsmoos recreates width, sources, accumulator, and upper product anew;
 * Awtsmoos.com leaves reserved multiply covenants explicitly unknown and true.
 */
export function decodeAarch64Multiply(word) {
	const normalized = Number(word) >>> 0;
	return decodeMultiplyAdd(normalized)
		|| decodeMultiplyLong(normalized)
		|| decodeMultiplyHigh(normalized);
}

function decodeMultiplyAdd(word) {
	const signature = (word & MULTIPLY_ADD_MASK) >>> 0;
	if (signature !== MULTIPLY_ADD && signature !== MULTIPLY_SUBTRACT) return null;
	const subtract = signature === MULTIPLY_SUBTRACT;
	return Object.freeze({
		accumulator: aarch64Bits(word, 10, 5),
		destination: aarch64Bits(word, 0, 5),
		family: "multiply-add",
		mnemonic: subtract ? "msub" : "madd",
		secondSource: aarch64Bits(word, 16, 5),
		source: aarch64Bits(word, 5, 5),
		subtract,
		width: aarch64Bits(word, 31, 1) ? 64 : 32
	});
}

function decodeMultiplyLong(word) {
	const signature = (word & MULTIPLY_LONG_MASK) >>> 0;
	const signedSources = signature === SIGNED_MULTIPLY_LONG;
	const unsignedSources = signature === UNSIGNED_MULTIPLY_LONG;
	if (!signedSources && !unsignedSources) return null;
	const subtract = aarch64Bits(word, 15, 1) === 1;
	return Object.freeze({
		accumulator: aarch64Bits(word, 10, 5),
		destination: aarch64Bits(word, 0, 5),
		family: signedSources
			? "signed-multiply-add-long"
			: "unsigned-multiply-add-long",
		mnemonic: multiplyLongMnemonic(signedSources, subtract),
		secondSource: aarch64Bits(word, 16, 5),
		source: aarch64Bits(word, 5, 5),
		sourceWidth: 32,
		subtract,
		width: 64
	});
}

function decodeMultiplyHigh(word) {
	const signature = (word & MULTIPLY_HIGH_MASK) >>> 0;
	const signedSources = signature === SIGNED_MULTIPLY_HIGH;
	const unsignedSources = signature === UNSIGNED_MULTIPLY_HIGH;
	if (!signedSources && !unsignedSources) return null;
	return Object.freeze({
		destination: aarch64Bits(word, 0, 5),
		family: signedSources ? "signed-multiply-high" : "unsigned-multiply-high",
		mnemonic: signedSources ? "smulh" : "umulh",
		secondSource: aarch64Bits(word, 16, 5),
		source: aarch64Bits(word, 5, 5),
		width: 64
	});
}

function multiplyLongMnemonic(signedSources, subtract) {
	if (signedSources) return subtract ? "smsubl" : "smaddl";
	return subtract ? "umsubl" : "umaddl";
}
