//B"H
//Boruch Hashem
//Blessed is He

import { decodeMemoryInstruction, isMemoryModRm } from "./x64Addressing.js";
import { decodeAccumulatorByte } from "./x64AccumulatorDecode.js";
import { decodeByteInstruction } from "./x64ByteDecode.js";
import {
	decodeLegacyPrefixedInstruction,
	decodeLockedInstruction,
	decodeMoveImmediate,
	registerFromOpcode
} from "./x64CoreDecode.js";
import { decodeRelative32, decodeRelative8, decodeTwoByte } from "./x64FlowDecode.js";
import { decodeCqo, decodeUnaryGroup } from "./x64GroupDecode.js";
import { decodeIndirectGroup, decodePushImmediate } from "./x64IndirectDecode.js";
import { decodedInstruction, unsupportedOpcode } from "./x64Instruction.js";
import { decodeMemoryImmediate } from "./x64MemoryImmediateDecode.js";
import { decodeRegisterModRm } from "./x64ModRm.js";
import { readX64Prefixes, validateX64PrefixUse } from "./x64Prefixes.js";

const BYTE_OPCODES = new Set([0x80, 0x84, 0x88, 0x8a, 0xc6]);
const SHORT_FLOW = new Set([
	0x72, 0x73, 0x74, 0x75, 0x76, 0x77,
	0x7c, 0x7d, 0x7e, 0x7f, 0xeb
]);
const MODRM_OPCODES = new Set([
	0x01, 0x09, 0x21, 0x29, 0x31, 0x39,
	0x81, 0x83, 0x85, 0x89, 0x8b, 0xc7
]);

/**
 * Decodes the documented portable x86-64 subset. The Awtsmoos creates opcode,
 * prefix garment, exact immediate, and memory road anew; Awtsmoos.com rejects
 * every unlisted shape while preserving all proven guest instruction bits.
 */
export function decodePortableX64(memory, rip) {
	const prefixes = readX64Prefixes(memory, rip);
	const { cursor, rex } = prefixes;
	const opcode = memory.u8(cursor);
	validateX64PrefixUse(memory, rip, prefixes);
	if (prefixes.lock) {
		return decodeLockedInstruction(
			memory,
			rip,
			cursor,
			opcode,
			rex,
			prefixes.mandatoryPrefix
		);
	}
	if (prefixes.mandatoryPrefix !== null && opcode !== 0x0f) {
		return decodeLegacyPrefixedInstruction(
			memory,
			rip,
			cursor,
			opcode,
			rex,
			prefixes.mandatoryPrefix
		);
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
	const accumulator = decodeAccumulatorByte(memory, rip, cursor, opcode, rex);
	if (accumulator) return accumulator;
	if (BYTE_OPCODES.has(opcode)) {
		return decodeByteInstruction(memory, rip, cursor, opcode, rex);
	}
	if (opcode === 0x68) return decodePushImmediate(memory, rip, cursor);
	if (opcode === 0xff) return decodeIndirectGroup(memory, rip, cursor, rex);
	if (opcode === 0x90 || opcode === 0xc3) {
		return decodedInstruction(opcode === 0x90 ? "nop" : "ret", rip, cursor + 1);
	}
	if (opcode === 0xe8 || opcode === 0xe9) {
		return decodeRelative32(memory, rip, cursor, opcode);
	}
	if (SHORT_FLOW.has(opcode)) return decodeRelative8(memory, rip, cursor, opcode);
	if (opcode === 0x0f) {
		return decodeTwoByte(memory, rip, cursor, rex, prefixes.mandatoryPrefix);
	}
	if (opcode === 0x99) return decodeCqo(rip, cursor, rex);
	if (opcode === 0xf7 || opcode === 0xc1) {
		return decodeUnaryGroup(memory, rip, cursor, opcode, rex);
	}
	if (opcode === 0x8d) {
		return decodeMemoryInstruction(memory, rip, cursor, opcode, rex);
	}
	if ([0x81, 0x83].includes(opcode) && isMemoryModRm(memory, cursor)) {
		return decodeMemoryImmediate(memory, rip, cursor, opcode, rex);
	}
	if (MODRM_OPCODES.has(opcode)) {
		if ([0x89, 0x8b, 0xc7].includes(opcode) && isMemoryModRm(memory, cursor)) {
			return decodeMemoryInstruction(memory, rip, cursor, opcode, rex);
		}
		return decodeRegisterModRm(memory, rip, cursor, opcode, rex);
	}
	throw unsupportedOpcode(rip, opcode);
}
