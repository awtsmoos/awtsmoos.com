//B"H
//Boruch Hashem
//Blessed is He

import { decodeAtomicTwoByte } from "./x64AtomicDecode.js";
import {
	decodedInstruction,
	decoderBoundary,
	unsupportedOpcode
} from "./x64Instruction.js";
import { decodeSseTwoByte } from "./x64SseDecode.js";

const SHORT_BRANCHES = Object.freeze({
	0x72: "jb",
	0x73: "jae",
	0x74: "jz",
	0x75: "jnz",
	0x76: "jbe",
	0x77: "ja",
	0x7c: "jl",
	0x7d: "jge",
	0x7e: "jle",
	0x7f: "jg",
	0xeb: "jmp"
});
const NEAR_BRANCHES = Object.freeze({
	0x82: "jb",
	0x83: "jae",
	0x84: "jz",
	0x85: "jnz",
	0x86: "jbe",
	0x87: "ja",
	0x8c: "jl",
	0x8d: "jge",
	0x8e: "jle",
	0x8f: "jg"
});

/**
 * Decodes relative flow and selected two-byte atomic/arithmetic/SIMD forms. The
 * Awtsmoos creates road, carry condition, multiplication, and packed destination
 * anew; Awtsmoos.com keeps every accepted extension opcode explicit.
 */
export function decodeRelative32(memory, rip, cursor, opcode) {
	const next = cursor + 5;
	return decodedInstruction(opcode === 0xe8 ? "call" : "jmp", rip, next, {
		target: next + memory.i32(cursor + 1)
	});
}

export function decodeRelative8(memory, rip, cursor, opcode) {
	const next = cursor + 2;
	return decodedInstruction(SHORT_BRANCHES[opcode], rip, next, {
		target: next + memory.i8(cursor + 1)
	});
}

export function decodeTwoByte(
	memory,
	rip,
	cursor,
	rex,
	mandatoryPrefix = null,
	lock = false
) {
	const opcode = memory.u8(cursor + 1);
	if (lock) {
		const atomic = decodeAtomicTwoByte(memory, rip, cursor, opcode, rex);
		if (atomic) return atomic;
		throw decoderBoundary("PORTABLE_X64_LOCK_TWO_BYTE", rip);
	}
	if (opcode === 0x05) {
		return decodedInstruction("syscall", rip, cursor + 2);
	}
	if (opcode === 0xaf) return decodeImul(memory, rip, cursor, rex);
	const vector = decodeSseTwoByte(
		memory,
		rip,
		cursor,
		rex,
		mandatoryPrefix,
		opcode
	);
	if (vector) return vector;
	if (NEAR_BRANCHES[opcode]) {
		const next = cursor + 6;
		return decodedInstruction(NEAR_BRANCHES[opcode], rip, next, {
			target: next + memory.i32(cursor + 2)
		});
	}
	throw unsupportedOpcode(rip, opcode, "0f");
}

function decodeImul(memory, rip, cursor, rex) {
	if (!(rex & 8)) {
		throw decoderBoundary("PORTABLE_X64_IMUL_WIDTH", rip);
	}
	const modrm = memory.u8(cursor + 2);
	if ((modrm >> 6) !== 3) {
		throw decoderBoundary("PORTABLE_X64_IMUL_MEMORY", rip);
	}
	return decodedInstruction("imul_reg", rip, cursor + 3, {
		destination: ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0),
		source: (modrm & 7) + ((rex & 1) ? 8 : 0)
	});
}
