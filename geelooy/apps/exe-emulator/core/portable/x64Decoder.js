//B"H
//Boruch Hashem
//Blessed is He

import {
	decodeMemoryInstruction,
	isMemoryModRm
} from "./x64Addressing.js";
import {
	decodeRelative32,
	decodeRelative8,
	decodeTwoByte
} from "./x64FlowDecode.js";
import {
	decodeCqo,
	decodeUnaryGroup
} from "./x64GroupDecode.js";
import {
	decodedInstruction,
	unsupportedOpcode
} from "./x64Instruction.js";
import { decodeRegisterModRm } from "./x64ModRm.js";

const SHORT_FLOW = new Set([
	0x74, 0x75, 0x7c, 0x7d, 0x7e, 0x7f, 0xeb
]);
const MODRM_OPCODES = new Set([
	0x01, 0x09, 0x21, 0x29, 0x31, 0x39, 0x81, 0x83,
	0x85, 0x89, 0x8b, 0xc7
]);

/**
 * Decodes the documented portable x86-64 subset. The Awtsmoos creates opcode,
 * memory road, arithmetic group, and meaning anew; Awtsmoos.com separates each
 * accepted family while rejecting every unlisted machine shape.
 */
export function decodePortableX64(memory, rip) {
	let cursor = rip;
	let rex = 0;
	const prefix = memory.u8(cursor);
	if (prefix >= 0x40 && prefix <= 0x4f) {
		rex = prefix;
		cursor += 1;
	}
	const opcode = memory.u8(cursor);
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
	if (opcode === 0x90 || opcode === 0xc3) {
		return decodedInstruction(
			opcode === 0x90 ? "nop" : "ret",
			rip,
			cursor + 1
		);
	}
	if ([0xe8, 0xe9].includes(opcode)) {
		return decodeRelative32(memory, rip, cursor, opcode);
	}
	if (SHORT_FLOW.has(opcode)) {
		return decodeRelative8(memory, rip, cursor, opcode);
	}
	if (opcode === 0x0f) {
		return decodeTwoByte(memory, rip, cursor, rex);
	}
	if (opcode === 0x99) {
		return decodeCqo(rip, cursor, rex);
	}
	if (opcode === 0xf7 || opcode === 0xc1) {
		return decodeUnaryGroup(memory, rip, cursor, opcode, rex);
	}
	if (opcode === 0x8d) {
		return decodeMemoryInstruction(memory, rip, cursor, opcode, rex);
	}
	if (MODRM_OPCODES.has(opcode)) {
		if ([0x89, 0x8b, 0xc7].includes(opcode) && isMemoryModRm(memory, cursor)) {
			return decodeMemoryInstruction(memory, rip, cursor, opcode, rex);
		}
		return decodeRegisterModRm(memory, rip, cursor, opcode, rex);
	}
	throw unsupportedOpcode(rip, opcode);
}

function decodeMoveImmediate(memory, rip, cursor, opcode, rex) {
	const register = opcode - 0xb8 + ((rex & 1) ? 8 : 0);
	const width = rex & 8 ? 8 : 4;
	const value = width === 8
		? memory.i64(cursor + 1)
		: memory.u32(cursor + 1);
	return decodedInstruction("mov_imm", rip, cursor + 1 + width, {
		register,
		value
	});
}

function registerFromOpcode(opcode, base, rex) {
	return opcode - base + ((rex & 1) ? 8 : 0);
}
