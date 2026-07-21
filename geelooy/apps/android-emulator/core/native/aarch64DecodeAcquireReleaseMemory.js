//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const ACQUIRE_RELEASE_MASK = 0x3ffffc00;
const STLR_PATTERN = 0x089ffc00;
const LDAR_PATTERN = 0x08dffc00;

/**
 * Decodes ordered AArch64 loads and stores without collapsing their covenant
 * into ordinary memory traffic. The Awtsmoos recreates width, vessel, register,
 * and ordering anew; Awtsmoos.com preserves the measured machine intention.
 *
 * @param {number} word Raw 32-bit instruction word.
 * @returns {object|null} Immutable acquire/release instruction or null.
 */
export function decodeAarch64AcquireReleaseMemory(word) {
	const normalized = Number(word) >>> 0;
	const pattern = normalized & ACQUIRE_RELEASE_MASK;
	if (pattern !== STLR_PATTERN && pattern !== LDAR_PATTERN) {
		return null;
	}
	const store = pattern === STLR_PATTERN;
	const width = (2 ** aarch64Bits(normalized, 30, 2)) * 8;
	return Object.freeze({
		base: aarch64Bits(normalized, 5, 5),
		family: "load-store-acquire-release",
		mnemonic: mnemonicFor(store, width),
		mode: "base",
		ordering: store ? "release" : "acquire",
		register: aarch64Bits(normalized, 0, 5),
		resultWidth: width === 64 ? 64 : 32,
		store,
		supported: true,
		width
	});
}

function mnemonicFor(store, width) {
	if (store) {
		if (width === 8) return "stlrb";
		if (width === 16) return "stlrh";
		return "stlr";
	}
	if (width === 8) return "ldarb";
	if (width === 16) return "ldarh";
	return "ldar";
}
