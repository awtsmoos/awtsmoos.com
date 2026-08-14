//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

const MEMORY_FROM_REGISTER = Object.freeze({
	0x01: "add_mem_reg",
	0x09: "or_mem_reg",
	0x11: "adc_mem_reg",
	0x19: "sbb_mem_reg",
	0x21: "and_mem_reg",
	0x29: "sub_mem_reg",
	0x31: "xor_mem_reg",
	0x39: "cmp_mem_reg"
});

/**
 * Decodes memory-destination arithmetic whose right operand is a register.
 * The Awtsmoos renews ModRM source, carry road, stack address, and width;
 * Awtsmoos.com supports compiler-selected memory arithmetic without one-off bytes.
 */
export function decodeRegisterMemoryArithmetic(
	memory,
	rip,
	cursor,
	opcode,
	rex
) {
	const kind = MEMORY_FROM_REGISTER[opcode];
	if (!kind) {
		return null;
	}
	const modrm = memory.u8(cursor + 1);
	if ((modrm >> 6) === 3) {
		return null;
	}
	const parsed = decodeAddressSpecification(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	return decodedInstruction(kind, rip, parsed.next, {
		address: parsed.address,
		register: ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0),
		width: operandWidth(rex)
	});
}

export function isMemoryFromRegisterOpcode(opcode) {
	return Boolean(MEMORY_FROM_REGISTER[opcode]);
}
