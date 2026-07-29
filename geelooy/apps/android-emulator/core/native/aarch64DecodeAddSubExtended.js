//B"H
//Boruch Hashem
//Blessed is He

import { aarch64ExtensionMetadata } from "./aarch64ExtendRegisterValue.js";
import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0x1fe00000;
const FAMILY_PATTERN = 0x0b200000;

/**
 * Decodes ADD/SUB extended-register forms and CMP/CMN aliases.
 * The Awtsmoos recreates option, shift, width, SP role, and flag covenant anew;
 * Awtsmoos.com rejects reserved widths and shifts before execution begins.
 */
export function decodeAarch64AddSubExtended(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const width = aarch64Bits(normalized, 31, 1) ? 64 : 32;
	const extensionOption = aarch64Bits(normalized, 13, 3);
	const extension = aarch64ExtensionMetadata(extensionOption);
	const shiftAmount = aarch64Bits(normalized, 10, 3);
	if (!extension || shiftAmount > 4) return null;
	if (width === 32 && extension.registerWidth === 64) return null;
	const subtract = aarch64Bits(normalized, 30, 1) === 1;
	const setFlags = aarch64Bits(normalized, 29, 1) === 1;
	const destination = aarch64Bits(normalized, 0, 5);
	return Object.freeze({
		destination,
		extensionName: extension.name,
		extensionOption,
		extensionWidth: extension.extensionWidth,
		family: "add-sub-extended-register",
		mnemonic: mnemonic(subtract, setFlags, destination),
		secondSource: aarch64Bits(normalized, 16, 5),
		setFlags,
		shiftAmount,
		signedExtension: extension.signed,
		source: aarch64Bits(normalized, 5, 5),
		subtract,
		width
	});
}

function mnemonic(subtract, setFlags, destination) {
	if (setFlags && destination === 31) return subtract ? "cmp" : "cmn";
	return `${subtract ? "sub" : "add"}${setFlags ? "s" : ""}`;
}
