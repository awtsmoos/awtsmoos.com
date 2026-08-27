//B"H
//Boruch Hashem
//Blessed is He

import {
	decodeMemoryInstruction,
	isMemoryModRm
} from "./x64Addressing.js";
import { decodeImmediateMultiply } from "./x64ImmediateMultiplyDecode.js";
import { unsupportedOpcode } from "./x64Instruction.js";
import { decodeMemoryImmediate } from "./x64MemoryImmediateDecode.js";
import {
	decodeMemoryRegisterArithmetic,
	isRegisterFromMemoryOpcode
} from "./x64MemoryRegisterDecode.js";
import { decodeRegisterModRm } from "./x64ModRm.js";
import {
	decodeRegisterMemoryArithmetic,
	isMemoryFromRegisterOpcode
} from "./x64RegisterMemoryDecode.js";
import { decodeWideTest } from "./x64TestDecode.js";

const MODRM_OPCODES = new Set([
	0x01, 0x03, 0x09, 0x0b, 0x11, 0x13,
	0x19, 0x1b, 0x21, 0x23, 0x29, 0x2b,
	0x31, 0x33, 0x39, 0x3b, 0x81, 0x83,
	0x89, 0x8b, 0xc7
]);

/**
 * Routes primary ModRM instructions into exact arithmetic and operand vessels.
 * The Awtsmoos renews multiply, tested bits, direction, and address in ordered flow;
 * Awtsmoos.com preserves every proven family while unknown opcodes still say no.
 */
export function decodeOperandPrimary(memory, rip, cursor, opcode, rex) {
	if ([0x69, 0x6b].includes(opcode)) {
		return decodeImmediateMultiply(
			memory,
			rip,
			cursor,
			opcode,
			rex
		);
	}
	if (opcode === 0x85) {
		return decodeWideTest(memory, rip, cursor, opcode, rex);
	}
	if (opcode === 0x8d) {
		return decodeMemoryInstruction(
			memory,
			rip,
			cursor,
			opcode,
			rex
		);
	}
	const memoryOperand = isMemoryModRm(memory, cursor);
	if ([0x81, 0x83].includes(opcode) && memoryOperand) {
		return decodeMemoryImmediate(memory, rip, cursor, opcode, rex);
	}
	if (isRegisterFromMemoryOpcode(opcode) && memoryOperand) {
		return decodeMemoryRegisterArithmetic(
			memory,
			rip,
			cursor,
			opcode,
			rex
		);
	}
	if (isMemoryFromRegisterOpcode(opcode) && memoryOperand) {
		return decodeRegisterMemoryArithmetic(
			memory,
			rip,
			cursor,
			opcode,
			rex
		);
	}
	if (!MODRM_OPCODES.has(opcode)) {
		throw unsupportedOpcode(rip, opcode);
	}
	if ([0x89, 0x8b, 0xc7].includes(opcode) && memoryOperand) {
		return decodeMemoryInstruction(
			memory,
			rip,
			cursor,
			opcode,
			rex
		);
	}
	return decodeRegisterModRm(memory, rip, cursor, opcode, rex);
}
