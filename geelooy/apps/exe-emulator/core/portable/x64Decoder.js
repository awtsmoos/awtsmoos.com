//B"H
//Boruch Hashem
//Blessed is He

import { decodeMemoryInstruction, isMemoryModRm } from "./x64Addressing.js";
import { decodeAtomicOneByte } from "./x64AtomicDecode.js";
import { decodeByteInstruction } from "./x64ByteDecode.js";
import { decodeRelative32, decodeRelative8, decodeTwoByte } from "./x64FlowDecode.js";
import { decodeCqo, decodeUnaryGroup } from "./x64GroupDecode.js";
import { decodeIndirectGroup, decodePushImmediate } from "./x64IndirectDecode.js";
import { decodedInstruction, decoderBoundary, unsupportedOpcode } from "./x64Instruction.js";
import { decodeRegisterModRm } from "./x64ModRm.js";
import { readX64Prefixes } from "./x64Prefixes.js";
import { operandWidth } from "./x64Width.js";
import { decodeWordMemoryInstruction } from "./x64WordDecode.js";

const BYTE_OPCODES = new Set([0x80, 0x84, 0x88, 0x8a, 0xc6]);
const SHORT_FLOW = new Set([
	0x72, 0x73, 0x74, 0x75, 0x76, 0x77,
	0x7c, 0x7d, 0x7e, 0x7f, 0xeb
]);
const MODRM_OPCODES = new Set([
	0x01, 0x09, 0x21, 0x29, 0x31, 0x39, 0x81, 0x83,
	0x85, 0x89, 0x8b, 0xc7
]);

/**
 * Decodes the documented portable x86-64 subset. The Awtsmoos creates opcode,
 * lock, vector garment, memory road, and meaning anew; Awtsmoos.com rejects every
 * unlisted shape while allowing measured compiler-generated instruction families.
 */
export function decodePortableX64(memory, rip) {
	const prefixes = readX64Prefixes(memory, rip);
	const cursor = prefixes.cursor;
	const rex = prefixes.rex;
	const opcode = memory.u8(cursor);
	if (prefixes.lock) {
		return decodeLocked(memory, rip, cursor, opcode, rex, prefixes.mandatoryPrefix);
	}
	if (prefixes.mandatoryPrefix !== null && opcode !== 0x0f) {
		return decodeLegacyPrefixed(memory, rip, cursor, opcode, rex, prefixes.mandatoryPrefix);
	}
	if (opcode >= 0xb8 && opcode <= 0xbf) {
		return decodeMoveImmediate(memory, rip, cursor, opcode, rex);
	}
	if (opcode >= 0x50 && opcode <= 0x57) {
		return decodedInstruction("push", rip, cursor + 1, {
			register: registerFromOpcode(opcode, 0x50, rex)
		});
	}
	if (opcode >= 0x58 && opcode <= 0x5f) {
		return decodedInstruction("pop", rip, cursor + 1, {
			register: registerFromOpcode(opcode, 0x58, rex)
		});
	}
	if (BYTE_OPCODES.has(opcode)) {
		return decodeByteInstruction(memory, rip, cursor, opcode, rex);
	}
	if (opcode === 0x68) return decodePushImmediate(memory, rip, cursor);
	if (opcode === 0xff) return decodeIndirectGroup(memory, rip, cursor, rex);
	if (opcode === 0x90 || opcode === 0xc3) {
		return decodedInstruction(opcode === 0x90 ? "nop" : "ret", rip, cursor + 1);
	}
	if ([0xe8, 0xe9].includes(opcode)) return decodeRelative32(memory, rip, cursor, opcode);
	if (SHORT_FLOW.has(opcode)) return decodeRelative8(memory, rip, cursor, opcode);
	if (opcode === 0x0f) {
		return decodeTwoByte(memory, rip, cursor, rex, prefixes.mandatoryPrefix);
	}
	if (opcode === 0x99) return decodeCqo(rip, cursor, rex);
	if (opcode === 0xf7 || opcode === 0xc1) {
		return decodeUnaryGroup(memory, rip, cursor, opcode, rex);
	}
	if (opcode === 0x8d) return decodeMemoryInstruction(memory, rip, cursor, opcode, rex);
	if (MODRM_OPCODES.has(opcode)) {
		if ([0x89, 0x8b, 0xc7].includes(opcode) && isMemoryModRm(memory, cursor)) {
			return decodeMemoryInstruction(memory, rip, cursor, opcode, rex);
		}
		return decodeRegisterModRm(memory, rip, cursor, opcode, rex);
	}
	throw unsupportedOpcode(rip, opcode);
}

function decodeLocked(memory, rip, cursor, opcode, rex, mandatoryPrefix) {
	if (mandatoryPrefix !== null) {
		throw decoderBoundary("PORTABLE_X64_LOCK_PREFIX_CONFLICT", rip);
	}
	if (opcode === 0x0f) {
		return decodeTwoByte(memory, rip, cursor, rex, null, true);
	}
	const instruction = decodeAtomicOneByte(memory, rip, cursor, opcode, rex);
	if (instruction) return instruction;
	throw decoderBoundary("PORTABLE_X64_LOCK_OPCODE", rip);
}

function decodeLegacyPrefixed(memory, rip, cursor, opcode, rex, prefix) {
	if (prefix === 0x66
		&& [0x89, 0x8b, 0xc7].includes(opcode)
		&& isMemoryModRm(memory, cursor)) {
		return decodeWordMemoryInstruction(memory, rip, cursor, opcode, rex);
	}
	throw decoderBoundary("PORTABLE_X64_LEGACY_PREFIX", rip);
}

function decodeMoveImmediate(memory, rip, cursor, opcode, rex) {
	const register = opcode - 0xb8 + ((rex & 1) ? 8 : 0);
	const width = operandWidth(rex);
	const value = width === 64 ? memory.i64(cursor + 1) : memory.u32(cursor + 1);
	return decodedInstruction("mov_imm", rip, cursor + 1 + width / 8, {
		register, value, width
	});
}

function registerFromOpcode(opcode, base, rex) {
	return opcode - base + ((rex & 1) ? 8 : 0);
}
