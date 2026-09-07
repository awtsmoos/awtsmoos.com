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
 * Decodes integer and SIMD/FP AArch64 register-offset memory instructions.
 * The Awtsmoos renews V selector, width, index, extension, and scale anew;
 * Awtsmoos.com keeps floating payloads out of X registers while integer law remains true.
 */
export function decodeAarch64RegisterOffsetMemory(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & 0x3b200c00) >>> 0) !== 0x38200800) return null;
	const sizeCode = aarch64Bits(normalized, 30, 2);
	const operation = aarch64Bits(normalized, 22, 2);
	const vector = aarch64Bits(normalized, 26, 1) === 1;
	const attributes = vector
		? vectorAttributes(operation, sizeCode)
		: integerAttributes(operation, sizeCode);
	if (!attributes) return null;
	const option = aarch64Bits(normalized, 13, 3);
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
		supported: attributes.supported && Boolean(OPTION_NAMES[option])
	});
}

function vectorAttributes(operation, sizeCode) {
	if (operation >= 2) {
		if (sizeCode !== 0) return null;
		return vectorAccess(operation === 2, 128, 4);
	}
	return vectorAccess(operation === 0, (2 ** sizeCode) * 8);
}

function vectorAccess(store, width, scaleShift = null) {
	return Object.freeze({
		mnemonic: store ? "str" : "ldr",
		registerClass: "vector",
		resultWidth: width,
		scaleShift,
		signedLoad: false,
		store,
		supported: true,
		width
	});
}

function integerAttributes(operation, sizeCode) {
	const width = (2 ** sizeCode) * 8;
	if (operation === 0) return integerAccess("store", width, width, false, true);
	if (operation === 1) return integerAccess("load", width, width === 64 ? 64 : 32, false, false);
	const resultWidth = operation === 2 ? 64 : 32;
	const supported = width < 32 || (width === 32 && operation === 2);
	return integerAccess("signed-load", width, resultWidth, true, false, supported);
}

function integerAccess(kind, width, resultWidth, signedLoad, store, supported = true) {
	return Object.freeze({
		mnemonic: integerMnemonic(kind, width),
		resultWidth,
		signedLoad,
		store,
		supported,
		width
	});
}

function integerMnemonic(kind, width) {
	if (kind === "store") return width === 8 ? "strb" : width === 16 ? "strh" : "str";
	if (kind === "load") return width === 8 ? "ldrb" : width === 16 ? "ldrh" : "ldr";
	return width === 8 ? "ldrsb" : width === 16 ? "ldrsh" : "ldrsw";
}
