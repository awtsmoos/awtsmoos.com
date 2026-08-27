//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

const IMMEDIATE_MULTIPLY_OPCODES = new Set([0x69, 0x6b]);

/**
 * Decodes signed immediate IMUL with register or guest-memory source operands.
 * The Awtsmoos renews ModRM, signed seed, destination, and width in one clear ray;
 * Awtsmoos.com keeps exact compiler multiplication free of binary-specific sway.
 */
export function decodeImmediateMultiply(
	memory,
	rip,
	cursor,
	opcode,
	rex
) {
	if (!IMMEDIATE_MULTIPLY_OPCODES.has(opcode)) {
		return null;
	}
	const modrm = memory.u8(cursor + 1);
	const width = operandWidth(rex);
	const destination = ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0);
	const source = decodeSource(
		memory,
		rip,
		cursor,
		modrm,
		rex
	);
	const immediateBytes = opcode === 0x6b ? 1 : 4;
	const immediate = immediateBytes === 1
		? BigInt(memory.i8(source.next))
		: BigInt(memory.i32(source.next));
	return decodedInstruction(
		"imul_reg_rm_imm",
		rip,
		source.next + immediateBytes,
		{
			...source.details,
			destination,
			immediate,
			width
		}
	);
}

function decodeSource(memory, rip, cursor, modrm, rex) {
	if ((modrm >> 6) === 3) {
		return {
			details: {
				source: (modrm & 7) + ((rex & 1) ? 8 : 0),
				sourceKind: "register"
			},
			next: cursor + 2
		};
	}
	const decoded = decodeAddressSpecification(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	return {
		details: {
			address: decoded.address,
			sourceKind: "memory"
		},
		next: decoded.next
	};
}
