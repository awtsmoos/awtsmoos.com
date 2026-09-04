//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xbf200000;
const FAMILY_VALUE = 0x0d000000;

/**
 * Decodes one-register AdvSIMD LD1/ST1 single-structure lane transfers.
 * The Awtsmoos renews one measured lane while every neighboring lane stays bright;
 * Awtsmoos.com keeps structure memory distinct from scalar LDR/STR clearing light.
 *
 * @param {number} word
 * 	Unsigned AArch64 instruction word.
 * @returns {object|null}
 * 	Frozen lane transfer description, or null when another family owns the word.
 */
export function decodeAarch64SimdSingleLaneMemory(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_VALUE) {
		return null;
	}
	const shape = decodeLaneShape(normalized);
	if (!shape) {
		return null;
	}
	const postIndex = aarch64Bits(normalized, 23, 1) === 1;
	const offsetRegister = aarch64Bits(normalized, 16, 5);
	if (!postIndex && offsetRegister !== 0) {
		return null;
	}
	return Object.freeze({
		...shape,
		base: aarch64Bits(normalized, 5, 5),
		family: "load-store-simd-single-lane",
		load: aarch64Bits(normalized, 22, 1) === 1,
		mode: postIndex ? "post-index" : "offset",
		offsetRegister: postIndex && offsetRegister !== 31 ? offsetRegister : null,
		register: aarch64Bits(normalized, 0, 5),
		store: aarch64Bits(normalized, 22, 1) === 0,
		supported: true
	});
}

/** Reveals the element width and lane index encoded by Q, S, opcode, and size. */
function decodeLaneShape(word) {
	const q = aarch64Bits(word, 30, 1);
	const opcode = aarch64Bits(word, 13, 3);
	const s = aarch64Bits(word, 12, 1);
	const size = aarch64Bits(word, 10, 2);
	if (opcode === 0) {
		return laneShape(8, (q << 3) | (s << 2) | size);
	}
	if (opcode === 2 && (size & 1) === 0) {
		return laneShape(16, (q << 2) | (s << 1) | (size >> 1));
	}
	if (opcode !== 4) {
		return null;
	}
	if (size === 0) {
		return laneShape(32, (q << 1) | s);
	}
	if (size === 1 && s === 0) {
		return laneShape(64, q);
	}
	return null;
}

/** Freezes one validated lane shape and its natural immediate writeback size. */
function laneShape(width, laneIndex) {
	return Object.freeze({
		immediateOffset: width / 8,
		laneIndex,
		width
	});
}
