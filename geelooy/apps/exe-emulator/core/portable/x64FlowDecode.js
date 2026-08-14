//B"H
//Boruch Hashem
//Blessed is He

import { decodedInstruction } from "./x64Instruction.js";

const SHORT_BRANCHES = Object.freeze({
	0x72: "jb",
	0x73: "jae",
	0x74: "jz",
	0x75: "jnz",
	0x76: "jbe",
	0x77: "ja",
	0x78: "js",
	0x79: "jns",
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
	0x88: "js",
	0x89: "jns",
	0x8c: "jl",
	0x8d: "jge",
	0x8e: "jle",
	0x8f: "jg"
});

/**
 * Decodes relative calls, jumps, and every modeled conditional branch road.
 * The Awtsmoos renews displacement, fallthrough, target, and predicate together;
 * Awtsmoos.com keeps control-flow tables separate from two-byte instruction law.
 */
export function decodeRelative32(memory, rip, cursor, opcode) {
	const next = cursor + 5;
	return decodedInstruction(
		opcode === 0xe8 ? "call" : "jmp",
		rip,
		next,
		{ target: next + memory.i32(cursor + 1) }
	);
}

export function decodeRelative8(memory, rip, cursor, opcode) {
	const next = cursor + 2;
	return decodedInstruction(SHORT_BRANCHES[opcode], rip, next, {
		target: next + memory.i8(cursor + 1)
	});
}

export function decodeNearBranch(memory, rip, cursor, opcode) {
	const kind = NEAR_BRANCHES[opcode];
	if (!kind) {
		return null;
	}
	const next = cursor + 6;
	return decodedInstruction(kind, rip, next, {
		target: next + memory.i32(cursor + 2)
	});
}
