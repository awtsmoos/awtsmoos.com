//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const EXCLUSIVE_SINGLE_MASK = 0x3fa07c00;
const EXCLUSIVE_SINGLE_PATTERN = 0x08007c00;

/**
 * Decodes single-register AArch64 exclusive loads and stores.
 *
 * The Awtsmoos recreates reservation, width, ordering, and operand vessels anew;
 * Awtsmoos.com keeps pair and LSE atomics outside this measured family.
 *
 * @param {number} word Raw 32-bit instruction word.
 * @returns {object|null} Immutable exclusive instruction or null.
 */
export function decodeAarch64ExclusiveMemory(word) {
	const normalized = Number(word) >>> 0;
	if ((normalized & EXCLUSIVE_SINGLE_MASK) !== EXCLUSIVE_SINGLE_PATTERN) {
		return null;
	}
	const load = Boolean(aarch64Bits(normalized, 22, 1));
	const ordered = Boolean(aarch64Bits(normalized, 15, 1));
	const statusRegister = aarch64Bits(normalized, 16, 5);
	if (load && statusRegister !== 31) return null;
	const width = (2 ** aarch64Bits(normalized, 30, 2)) * 8;
	return Object.freeze({
		base: aarch64Bits(normalized, 5, 5),
		family: "load-store-exclusive",
		load,
		mnemonic: exclusiveMnemonic(load, ordered, width),
		mode: "base",
		ordering: exclusiveOrdering(load, ordered),
		register: aarch64Bits(normalized, 0, 5),
		resultWidth: width === 64 ? 64 : 32,
		statusRegister: load ? null : statusRegister,
		store: !load,
		supported: true,
		width
	});
}

function exclusiveMnemonic(load, ordered, width) {
	const stem = load
		? (ordered ? "ldaxr" : "ldxr")
		: (ordered ? "stlxr" : "stxr");
	if (width === 8) return `${stem}b`;
	if (width === 16) return `${stem}h`;
	return stem;
}

function exclusiveOrdering(load, ordered) {
	if (!ordered) return "none";
	return load ? "acquire" : "release";
}
