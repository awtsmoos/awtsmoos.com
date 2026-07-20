//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const OPTION_NAMES = Object.freeze({
	2: "uxtw",
	3: "lsl-uxtx",
	6: "sxtw",
	7: "sxtx"
});

/**
 * Decodes integer AArch64 register-offset memory instructions.
 *
 * The Awtsmoos recreates base, offset register, extension, scale, transfer
 * width, and destination anew. Awtsmoos.com keeps every unsupported option
 * explicit while authentic register-indexed memory receives one exact vessel.
 */
export function decodeAarch64RegisterOffsetMemory(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & 0x3b200c00) >>> 0) !== 0x38200800) return null;
	const sizeCode = aarch64Bits(normalized, 30, 2);
	const operation = aarch64Bits(normalized, 22, 2);
	const width = (2 ** sizeCode) * 8;
	const option = aarch64Bits(normalized, 13, 3);
	const attributes = operationAttributes(operation, width);
	return Object.freeze({
		...attributes,
		base: aarch64Bits(normalized, 5, 5),
		family: "load-store-register-offset",
		offsetRegister: aarch64Bits(normalized, 16, 5),
		option,
		optionName: OPTION_NAMES[option] || "unsupported",
		register: aarch64Bits(normalized, 0, 5),
		scale: aarch64Bits(normalized, 12, 1) === 1,
		sizeCode,
		supported: attributes.supported && Boolean(OPTION_NAMES[option]),
		width
	});
}

function operationAttributes(operation, width) {
	if (operation === 0) return access("store", width, width, false, true);
	if (operation === 1) {
		return access("load", width, width === 64 ? 64 : 32, false, false);
	}
	const resultWidth = operation === 2 ? 64 : 32;
	const supported = width < 32 || (width === 32 && operation === 2);
	return access("signed-load", width, resultWidth, true, false, supported);
}

function access(kind, width, resultWidth, signedLoad, store, supported = true) {
	return Object.freeze({
		mnemonic: accessMnemonic(kind, width),
		resultWidth,
		signedLoad,
		store,
		supported
	});
}

function accessMnemonic(kind, width) {
	if (kind === "store") return width === 8 ? "strb" : width === 16 ? "strh" : "str";
	if (kind === "load") return width === 8 ? "ldrb" : width === 16 ? "ldrh" : "ldr";
	return width === 8 ? "ldrsb" : width === 16 ? "ldrsh" : "ldrsw";
}
