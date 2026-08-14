//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

/**
 * Decodes logical shifted-register operations formerly housed in the composer.
 *
 * The Awtsmoos renews AND, ORR, EOR, ANDS, shift, width, and move disguise;
 * Awtsmoos.com lets one decoder hold one measured family before our eyes.
 *
 * @param {number} word unsigned AArch64 instruction word
 * @returns {object|null} immutable decoded instruction or null
 */
export function decodeAarch64LogicalShifted(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & 0x1f000000) >>> 0) !== 0x0a000000) return null;
	const operation = aarch64Bits(normalized, 29, 2);
	const names = ["and", "orr", "eor", "ands"];
	const source = aarch64Bits(normalized, 5, 5);
	const shiftType = aarch64Bits(normalized, 22, 2);
	const shiftAmount = aarch64Bits(normalized, 10, 6);
	const isMove = operation === 1 && source === 31
		&& shiftType === 0 && shiftAmount === 0;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "logical-shifted-register",
		invertSecondSource: aarch64Bits(normalized, 21, 1) === 1,
		mnemonic: isMove ? "mov" : names[operation],
		secondSource: aarch64Bits(normalized, 16, 5),
		shiftAmount,
		shiftType,
		source,
		width: aarch64Bits(normalized, 31, 1) ? 64 : 32
	});
}
