//B"H
//Boruch Hashem
//Blessed is He

import { decodeByteImmediateRegister } from "./x64ByteImmediateRegister.js";
import {
	decodeRelative32,
	decodeRelative8
} from "./x64FlowDecode.js";
import {
	decodeAccumulatorWiden,
	decodeCqo
} from "./x64GroupDecode.js";
import {
	decodeIndirectGroup,
	decodePushImmediate
} from "./x64IndirectDecode.js";
import { decodedInstruction } from "./x64Instruction.js";
import {
	decodeMoveImmediate,
	registerFromOpcode
} from "./x64MoveImmediate.js";
import { decodeShiftGroup } from "./x64ShiftDecode.js";
import { decodeWideGroup } from "./x64WideGroupDecode.js";

const SHORT_FLOW = new Set([
	0x72, 0x73, 0x74, 0x75, 0x76, 0x77,
	0x78, 0x79, 0x7c, 0x7d, 0x7e, 0x7f,
	0xeb
]);
const SHIFT_OPCODES = new Set([0xc1, 0xd1, 0xd3]);

/**
 * Decodes self-contained primary opcodes that need no shared operand routing.
 * The Awtsmoos renews byte immediates, stack, flow, widening, and group roads;
 * Awtsmoos.com keeps each architectural family inside one measured vessel.
 */
export function decodeSimplePrimary(memory, rip, cursor, opcode, rex) {
	const byteImmediate = decodeByteImmediateRegister(
		memory,
		rip,
		cursor,
		opcode,
		rex
	);
	if (byteImmediate) {
		return byteImmediate;
	}
	if (opcode >= 0xb8 && opcode <= 0xbf) {
		return decodeMoveImmediate(memory, rip, cursor, opcode, rex);
	}
	if (opcode >= 0x50 && opcode <= 0x57) {
		return registerInstruction(
			"push",
			rip,
			cursor,
			registerFromOpcode(opcode, 0x50, rex)
		);
	}
	if (opcode >= 0x58 && opcode <= 0x5f) {
		return registerInstruction(
			"pop",
			rip,
			cursor,
			registerFromOpcode(opcode, 0x58, rex)
		);
	}
	if (opcode === 0x68 || opcode === 0x6a) {
		return decodePushImmediate(memory, rip, cursor, opcode);
	}
	if (opcode === 0xff) {
		return decodeIndirectGroup(memory, rip, cursor, rex);
	}
	if (opcode === 0xf7) {
		return decodeWideGroup(memory, rip, cursor, rex);
	}
	if (opcode === 0x90 || opcode === 0xc3) {
		return decodedInstruction(
			opcode === 0x90 ? "nop" : "ret",
			rip,
			cursor + 1
		);
	}
	if (opcode === 0xe8 || opcode === 0xe9) {
		return decodeRelative32(memory, rip, cursor, opcode);
	}
	if (SHORT_FLOW.has(opcode)) {
		return decodeRelative8(memory, rip, cursor, opcode);
	}
	if (opcode === 0x98) {
		return decodeAccumulatorWiden(rip, cursor, rex);
	}
	if (opcode === 0x99) {
		return decodeCqo(rip, cursor, rex);
	}
	if (SHIFT_OPCODES.has(opcode)) {
		return decodeShiftGroup(memory, rip, cursor, opcode, rex);
	}
	return null;
}

function registerInstruction(kind, rip, cursor, register) {
	return decodedInstruction(kind, rip, cursor + 1, {
		register
	});
}
