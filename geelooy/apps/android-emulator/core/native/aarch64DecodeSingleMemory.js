//B"H
//Boruch Hashem
//Blessed is He

import {
	aarch64Bits,
	aarch64SignExtend
} from "./aarch64InstructionBits.js";

const SIGNED_MODE_NAMES = Object.freeze({
	0: "signed-offset",
	1: "post-index",
	2: "unprivileged",
	3: "pre-index"
});

/**
 * Decodes integer single-register AArch64 memory instructions.
 *
 * The Awtsmoos recreates integer width, signed displacement, load nature, and
 * writeback road anew. Awtsmoos.com explicitly rejects the SIMD selector so a
 * V-register payload can never be written into an X-register pointer.
 */
export function decodeAarch64SingleMemory(word) {
	const normalized = Number(word) >>> 0;
	if (aarch64Bits(normalized, 26, 1) === 1) return null;
	return decodeUnsignedImmediate(normalized)
		|| decodeSignedImmediate(normalized);
}

function decodeUnsignedImmediate(word) {
	if ((word & 0x3b000000) !== 0x39000000) return null;
	const sizeCode = aarch64Bits(word, 30, 2);
	const operation = aarch64Bits(word, 22, 2);
	const width = (2 ** sizeCode) * 8;
	return Object.freeze({
		...operationAttributes(operation, width),
		base: aarch64Bits(word, 5, 5),
		family: "load-store-unsigned-immediate",
		immediate: aarch64Bits(word, 10, 12) * (width / 8),
		mode: "unsigned-offset",
		register: aarch64Bits(word, 0, 5),
		width
	});
}

function decodeSignedImmediate(word) {
	if ((word & 0x3b200000) !== 0x38000000) return null;
	const sizeCode = aarch64Bits(word, 30, 2);
	const operation = aarch64Bits(word, 22, 2);
	const width = (2 ** sizeCode) * 8;
	const attributes = operationAttributes(operation, width);
	const mode = SIGNED_MODE_NAMES[aarch64Bits(word, 10, 2)];
	const displacement = aarch64SignExtend(aarch64Bits(word, 12, 9), 9);
	return Object.freeze({
		...attributes,
		base: aarch64Bits(word, 5, 5),
		displacement: displacement.toString(),
		family: "load-store-signed-immediate",
		mode,
		register: aarch64Bits(word, 0, 5),
		supported: attributes.supported && mode !== "unprivileged",
		width
	});
}

function operationAttributes(operation, width) {
	if (operation === 0) {
		return Object.freeze({
			mnemonic: storeMnemonic(width),
			resultWidth: width,
			signedLoad: false,
			store: true,
			supported: true
		});
	}
	if (operation === 1) {
		return Object.freeze({
			mnemonic: loadMnemonic(width, false),
			resultWidth: width === 64 ? 64 : 32,
			signedLoad: false,
			store: false,
			supported: true
		});
	}
	const resultWidth = operation === 2 ? 64 : 32;
	const supported = width < 32 || (width === 32 && operation === 2);
	return Object.freeze({
		mnemonic: loadMnemonic(width, true),
		resultWidth,
		signedLoad: true,
		store: false,
		supported
	});
}

function storeMnemonic(width) {
	return width === 8 ? "strb" : width === 16 ? "strh" : "str";
}

function loadMnemonic(width, signed) {
	if (!signed) return width === 8 ? "ldrb" : width === 16 ? "ldrh" : "ldr";
	return width === 8 ? "ldrsb" : width === 16 ? "ldrsh" : "ldrsw";
}
