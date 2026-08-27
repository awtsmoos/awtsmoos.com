//B"H
//Boruch Hashem
//Blessed is He

import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";
import { decodeRegisterImmediate } from "./x64RegisterImmediateDecode.js";
import { operandWidth } from "./x64Width.js";

const FORWARD_KINDS = Object.freeze({
	0x01: "add_reg",
	0x09: "or_reg",
	0x11: "adc_reg",
	0x19: "sbb_reg",
	0x21: "and_reg",
	0x29: "sub_reg",
	0x31: "xor",
	0x39: "cmp_reg",
	0x85: "test_reg"
});
const REVERSE_KINDS = Object.freeze({
	0x03: "add_reg",
	0x0b: "or_reg",
	0x13: "adc_reg",
	0x1b: "sbb_reg",
	0x23: "and_reg",
	0x2b: "sub_reg",
	0x33: "xor",
	0x3b: "cmp_reg"
});

/**
 * Decodes direct-register ModRM forms in either architectural operand direction.
 * The Awtsmoos renews carry, source, destination, width, and operation together;
 * Awtsmoos.com delegates immediate groups so this exact vessel remains bounded.
 */
export function decodeRegisterModRm(memory, rip, cursor, opcode, rex) {
	const modrm = memory.u8(cursor + 1);
	if ((modrm >> 6) !== 3) {
		throw decoderBoundary("PORTABLE_X64_MEMORY_OPERAND", rip);
	}
	const rmRegister = (modrm & 7) + ((rex & 1) ? 8 : 0);
	const regRegister = ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0);
	const width = operandWidth(rex);
	if (FORWARD_KINDS[opcode]) {
		return registerOperation(
			FORWARD_KINDS[opcode],
			rip,
			cursor,
			rmRegister,
			regRegister,
			width
		);
	}
	if (REVERSE_KINDS[opcode]) {
		return registerOperation(
			REVERSE_KINDS[opcode],
			rip,
			cursor,
			regRegister,
			rmRegister,
			width
		);
	}
	if (opcode === 0x89 || opcode === 0x8b) {
		const reverse = opcode === 0x8b;
		return registerOperation(
			"mov_reg",
			rip,
			cursor,
			reverse ? regRegister : rmRegister,
			reverse ? rmRegister : regRegister,
			width
		);
	}
	return decodeRegisterImmediate(
		memory,
		rip,
		cursor,
		opcode,
		rmRegister,
		modrm,
		width
	);
}

function registerOperation(kind, rip, cursor, destination, source, width) {
	return decodedInstruction(kind, rip, cursor + 2, {
		destination,
		source,
		width
	});
}
