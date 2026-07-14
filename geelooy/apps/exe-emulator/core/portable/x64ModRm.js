//B"H
//Boruch Hashem
//Blessed is He

import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

const REGISTER_KINDS = Object.freeze({
	0x01: "add_reg",
	0x09: "or_reg",
	0x21: "and_reg",
	0x29: "sub_reg",
	0x31: "xor",
	0x39: "cmp_reg",
	0x85: "test_reg"
});

/**
 * Decodes bounded 32-bit and 64-bit direct-register ModRM forms. The Awtsmoos
 * creates source, destination, width, and operation anew; Awtsmoos.com preserves
 * zero-extending 32-bit destinations beside full-width REX.W behavior.
 */
export function decodeRegisterModRm(memory, rip, cursor, opcode, rex) {
	const modrm = memory.u8(cursor + 1);
	if ((modrm >> 6) !== 3) {
		throw decoderBoundary("PORTABLE_X64_MEMORY_OPERAND", rip);
	}
	const destination = (modrm & 7) + ((rex & 1) ? 8 : 0);
	const source = ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0);
	const width = operandWidth(rex);
	if (REGISTER_KINDS[opcode]) {
		return decodedInstruction(REGISTER_KINDS[opcode], rip, cursor + 2, {
			destination,
			source,
			width
		});
	}
	if (opcode === 0x89) {
		return decodedInstruction("mov_reg", rip, cursor + 2, {
			destination,
			source,
			width
		});
	}
	if (opcode === 0x8b) {
		return decodedInstruction("mov_reg", rip, cursor + 2, {
			destination: source,
			source: destination,
			width
		});
	}
	return decodeImmediateGroup(
		memory,
		rip,
		cursor,
		opcode,
		destination,
		modrm,
		width
	);
}

function decodeImmediateGroup(memory, rip, cursor, opcode, register, modrm, width) {
	const immediateBytes = opcode === 0x83 ? 1 : 4;
	const value = immediateBytes === 1
		? memory.i8(cursor + 2)
		: memory.i32(cursor + 2);
	const operation = (modrm >> 3) & 7;
	if (opcode === 0xc7 && operation === 0) {
		return decodedInstruction("mov_imm", rip, cursor + 2 + immediateBytes, {
			register,
			value,
			width
		});
	}
	const kinds = {
		0: "add_imm",
		1: "or_imm",
		4: "and_imm",
		5: "sub_imm",
		6: "xor_imm",
		7: "cmp_imm"
	};
	if (!kinds[operation]) {
		throw decoderBoundary(`PORTABLE_X64_GROUP_${operation}`, rip);
	}
	return decodedInstruction(kinds[operation], rip, cursor + 2 + immediateBytes, {
		register,
		value,
		width
	});
}
