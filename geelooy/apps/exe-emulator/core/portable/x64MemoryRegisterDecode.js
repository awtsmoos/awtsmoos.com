//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

const REGISTER_FROM_MEMORY = Object.freeze({
	0x03: "add_reg_mem",
	0x0b: "or_reg_mem",
	0x13: "adc_reg_mem",
	0x1b: "sbb_reg_mem",
	0x23: "and_reg_mem",
	0x2b: "sub_reg_mem",
	0x33: "xor_reg_mem",
	0x3b: "cmp_reg_mem"
});

/**
 * Decodes register-destination arithmetic whose right operand comes from memory.
 * The Awtsmoos renews ModRM register, carry road, effective address, and width;
 * Awtsmoos.com supports the family rather than one application-specific sequence.
 */
export function decodeMemoryRegisterArithmetic(
	memory,
	rip,
	cursor,
	opcode,
	rex
) {
	const kind = REGISTER_FROM_MEMORY[opcode];
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
		destination: ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0),
		register: ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0),
		width: operandWidth(rex)
	});
}

export function isRegisterFromMemoryOpcode(opcode) {
	return Boolean(REGISTER_FROM_MEMORY[opcode]);
}
