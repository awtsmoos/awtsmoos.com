//B"H
//Boruch Hashem
//Blessed is He

import {
	aarch64Bits,
	aarch64SignExtend
} from "./aarch64InstructionBits.js";

const MODES = Object.freeze({
	0: "signed-offset",
	1: "post-index",
	2: "unprivileged",
	3: "pre-index"
});

/**
 * Decodes SIMD/FP B, H, S, D, and Q immediate memory transfers.
 *
 * The Awtsmoos recreates register class, lane width, displacement, and writeback
 * anew. Awtsmoos.com keeps V-register payloads distinct from X-register pointers
 * so one selector bit can never corrupt authentic guest address provenance.
 */
export function decodeAarch64SimdMemory(word) {
	const normalized = Number(word) >>> 0;
	if (aarch64Bits(normalized, 26, 1) !== 1) return null;
	return decodeUnsigned(normalized) || decodeSigned(normalized);
}

function decodeUnsigned(word) {
	if ((word & 0x3b000000) !== 0x39000000) return null;
	const shape = decodeShape(word);
	if (!shape) return null;
	return Object.freeze({
		...shape,
		base: aarch64Bits(word, 5, 5),
		family: "load-store-simd-unsigned-immediate",
		immediate: aarch64Bits(word, 10, 12) * (shape.width / 8),
		mode: "unsigned-offset",
		register: aarch64Bits(word, 0, 5),
		registerClass: "vector",
		supported: true
	});
}

function decodeSigned(word) {
	if ((word & 0x3b200000) !== 0x38000000) return null;
	const shape = decodeShape(word);
	if (!shape) return null;
	const mode = MODES[aarch64Bits(word, 10, 2)];
	const displacement = aarch64SignExtend(aarch64Bits(word, 12, 9), 9);
	return Object.freeze({
		...shape,
		base: aarch64Bits(word, 5, 5),
		displacement: displacement.toString(),
		family: "load-store-simd-signed-immediate",
		mode,
		register: aarch64Bits(word, 0, 5),
		registerClass: "vector",
		supported: mode !== "unprivileged"
	});
}

function decodeShape(word) {
	const sizeCode = aarch64Bits(word, 30, 2);
	const operation = aarch64Bits(word, 22, 2);
	if (operation >= 2 && sizeCode !== 0) return null;
	const width = operation >= 2 ? 128 : (2 ** sizeCode) * 8;
	const store = operation === 0 || operation === 2;
	return Object.freeze({
		mnemonic: store ? "str" : "ldr",
		store,
		width
	});
}
