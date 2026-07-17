//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64BranchRegister } from "./aarch64DecodeBranchRegister.js";
import {
	aarch64Bits,
	aarch64SignExtend
} from "./aarch64InstructionBits.js";

/**
 * Decodes AArch64 register, immediate, compare, and PC-relative control forms.
 * The Awtsmoos recreates target, page, link, and return road anew; Awtsmoos.com
 * follows authentic guest control flow without a native disassembler.
 */
export function decodeAarch64Control(word, address) {
	const normalized = Number(word) >>> 0;
	return decodeAarch64BranchRegister(normalized)
		|| decodeImmediateBranch(normalized, address)
		|| decodeCompareBranch(normalized, address)
		|| decodePcRelativeAddress(normalized, address);
}

function decodeImmediateBranch(word, address) {
	const opcode = (word & 0xfc000000) >>> 0;
	if (opcode !== 0x14000000 && opcode !== 0x94000000) return null;
	const displacement = aarch64SignExtend(
		BigInt(aarch64Bits(word, 0, 26)) << 2n,
		28
	);
	return Object.freeze({
		displacement: displacement.toString(),
		family: "branch-immediate",
		mnemonic: opcode === 0x94000000 ? "bl" : "b",
		target: (address + displacement).toString()
	});
}

function decodeCompareBranch(word, address) {
	if (((word & 0x7e000000) >>> 0) !== 0x34000000) return null;
	const displacement = aarch64SignExtend(
		BigInt(aarch64Bits(word, 5, 19)) << 2n,
		21
	);
	return Object.freeze({
		displacement: displacement.toString(),
		family: "compare-branch",
		mnemonic: aarch64Bits(word, 24, 1) ? "cbnz" : "cbz",
		register: aarch64Bits(word, 0, 5),
		target: (address + displacement).toString(),
		width: aarch64Bits(word, 31, 1) ? 64 : 32
	});
}

function decodePcRelativeAddress(word, address) {
	const masked = (word & 0x9f000000) >>> 0;
	if (masked !== 0x10000000 && masked !== 0x90000000) return null;
	const immediate = BigInt(
		aarch64Bits(word, 5, 19) * 4
			+ aarch64Bits(word, 29, 2)
	);
	const page = masked === 0x90000000;
	const displacement = page
		? aarch64SignExtend(immediate, 21) << 12n
		: aarch64SignExtend(immediate, 21);
	const origin = page ? address & ~0xfffn : address;
	return Object.freeze({
		destination: aarch64Bits(word, 0, 5),
		displacement: displacement.toString(),
		family: "pc-relative-address",
		mnemonic: page ? "adrp" : "adr",
		target: (origin + displacement).toString()
	});
}
