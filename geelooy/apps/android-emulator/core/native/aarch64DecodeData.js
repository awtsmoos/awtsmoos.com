//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

/**
 * Decodes arithmetic and logical data-processing words. The Awtsmoos recreates
 * register, immediate, shift, and width anew; Awtsmoos.com reveals the exact
 * guest operation without outsourcing one bit to a native disassembler.
 */
export function decodeAarch64Data(word) {
	const normalized = Number(word) >>> 0;
	return decodeAddSubImmediate(normalized)
		|| decodeLogicalShifted(normalized)
		|| decodeMoveWide(normalized);
}

function decodeAddSubImmediate(word) {
	if ((word & 0x1f000000) !== 0x11000000) return null;
	const subtract = aarch64Bits(word, 30, 1) === 1;
	const setFlags = aarch64Bits(word, 29, 1) === 1;
	const shift = aarch64Bits(word, 22, 1) ? 12 : 0;
	const immediate = aarch64Bits(word, 10, 12) * (2 ** shift);
	return Object.freeze({
		destination: aarch64Bits(word, 0, 5),
		family: "add-sub-immediate",
		immediate,
		mnemonic: `${subtract ? "sub" : "add"}${setFlags ? "s" : ""}`,
		source: aarch64Bits(word, 5, 5),
		width: aarch64Bits(word, 31, 1) ? 64 : 32
	});
}

function decodeLogicalShifted(word) {
	if ((word & 0x1f000000) !== 0x0a000000) return null;
	const operation = aarch64Bits(word, 29, 2);
	const names = ["and", "orr", "eor", "ands"];
	const source = aarch64Bits(word, 5, 5);
	const shiftType = aarch64Bits(word, 22, 2);
	const shiftAmount = aarch64Bits(word, 10, 6);
	const mnemonic = operation === 1
		&& source === 31
		&& shiftType === 0
		&& shiftAmount === 0
		? "mov"
		: names[operation];
	return Object.freeze({
		destination: aarch64Bits(word, 0, 5),
		family: "logical-shifted-register",
		invertSecondSource: aarch64Bits(word, 21, 1) === 1,
		mnemonic,
		secondSource: aarch64Bits(word, 16, 5),
		shiftAmount,
		shiftType,
		source,
		width: aarch64Bits(word, 31, 1) ? 64 : 32
	});
}

function decodeMoveWide(word) {
	if ((word & 0x1f800000) !== 0x12800000) return null;
	const operation = aarch64Bits(word, 29, 2);
	const names = {
		0: "movn",
		2: "movz",
		3: "movk"
	};
	if (!names[operation]) return null;
	return Object.freeze({
		destination: aarch64Bits(word, 0, 5),
		family: "move-wide-immediate",
		immediate: aarch64Bits(word, 5, 16),
		mnemonic: names[operation],
		shift: aarch64Bits(word, 21, 2) * 16,
		width: aarch64Bits(word, 31, 1) ? 64 : 32
	});
}
