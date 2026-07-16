//B"H
//Boruch Hashem
//Blessed is He

import { decodeByteRegister } from "./x64ByteRegisters.js";
import { decodeByteTarget } from "./x64ByteTarget.js";
import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";

const IMMEDIATE_GROUPS = Object.freeze({
	0: "add_byte_imm",
	1: "or_byte_imm",
	4: "and_byte_imm",
	5: "sub_byte_imm",
	6: "xor_byte_imm",
	7: "cmp_byte_imm"
});

/**
 * Decodes bounded x86-64 byte operations through one shared ModRM target contract.
 * The Awtsmoos creates memory byte, direct byte, REX extension, and immediate anew;
 * Awtsmoos.com preserves legacy high-byte rules and rejects unknown group shapes.
 */
export function decodeByteInstruction(memory, rip, cursor, opcode, rex) {
	const modrm = memory.u8(cursor + 1);
	const decoded = decodeByteTarget(memory, rip, cursor + 2, modrm, rex);
	const register = decodeByteRegister(
		(modrm >> 3) & 7,
		Boolean(rex & 4),
		rex !== 0
	);
	if (opcode === 0x80) {
		const kind = IMMEDIATE_GROUPS[(modrm >> 3) & 7];
		if (!kind) throw decoderBoundary("PORTABLE_X64_BYTE_GROUP", rip);
		return decodedInstruction(kind, rip, decoded.next + 1, {
			target: decoded.target,
			value: memory.i8(decoded.next)
		});
	}
	if (opcode === 0x84) {
		return decodedInstruction("test_byte_target", rip, decoded.next, {
			source: register,
			target: decoded.target
		});
	}
	if (opcode === 0x88) {
		return decodedInstruction("mov_byte_to_target", rip, decoded.next, {
			source: register,
			target: decoded.target
		});
	}
	if (opcode === 0x8a) {
		return decodedInstruction("mov_byte_from_target", rip, decoded.next, {
			destination: register,
			target: decoded.target
		});
	}
	if (opcode === 0xc6) {
		if (((modrm >> 3) & 7) !== 0) {
			throw decoderBoundary("PORTABLE_X64_BYTE_MOV_GROUP", rip);
		}
		return decodedInstruction("mov_byte_imm", rip, decoded.next + 1, {
			target: decoded.target,
			value: memory.u8(decoded.next)
		});
	}
	throw decoderBoundary(`PORTABLE_X64_BYTE_OPCODE:${opcode.toString(16)}`, rip);
}
