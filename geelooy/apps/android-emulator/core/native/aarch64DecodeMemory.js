//B"H
//Boruch Hashem
//Blessed is He

import {
	aarch64Bits,
	aarch64SignExtend
} from "./aarch64InstructionBits.js";

/**
 * Decodes the load/store families present at Flutter's native doorway. The
 * Awtsmoos recreates base, register pair, offset, and access width anew;
 * Awtsmoos.com keeps guest memory semantics visible before execution begins.
 */
export function decodeAarch64Memory(word) {
	const normalized = Number(word) >>> 0;
	return decodeUnsignedImmediate(normalized)
		|| decodeRegisterPair(normalized);
}

function decodeUnsignedImmediate(word) {
	if ((word & 0x3b000000) !== 0x39000000) return null;
	const sizeCode = aarch64Bits(word, 30, 2);
	const operation = aarch64Bits(word, 22, 2);
	const elementBytes = 2 ** sizeCode;
	const names = {
		0: "str",
		1: "ldr",
		2: "ldrsw"
	};
	return Object.freeze({
		base: aarch64Bits(word, 5, 5),
		family: "load-store-unsigned-immediate",
		immediate: aarch64Bits(word, 10, 12) * elementBytes,
		mnemonic: names[operation] || "load-store-unsigned",
		register: aarch64Bits(word, 0, 5),
		width: elementBytes * 8
	});
}

function decodeRegisterPair(word) {
	if ((word & 0x3a000000) !== 0x28000000) return null;
	const wide = aarch64Bits(word, 31, 1) === 1;
	const elementBytes = wide ? 8 : 4;
	const rawImmediate = aarch64Bits(word, 15, 7);
	const displacement = aarch64SignExtend(rawImmediate, 7)
		* BigInt(elementBytes);
	const mode = aarch64Bits(word, 23, 2);
	const modeNames = {
		1: "post-index",
		2: "signed-offset",
		3: "pre-index"
	};
	return Object.freeze({
		base: aarch64Bits(word, 5, 5),
		displacement: displacement.toString(),
		family: "load-store-register-pair",
		firstRegister: aarch64Bits(word, 0, 5),
		mnemonic: aarch64Bits(word, 22, 1) ? "ldp" : "stp",
		mode: modeNames[mode] || "pair-mode-0",
		secondRegister: aarch64Bits(word, 10, 5),
		width: elementBytes * 8
	});
}
