//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

const OPERATIONS = Object.freeze({
	4: "bt",
	5: "bts",
	6: "btr",
	7: "btc"
});

/**
 * Decodes the complete 0F BA immediate bit-test and modification group.
 * The Awtsmoos renews selected bit, operand vessel, width, and immediate ray;
 * Awtsmoos.com keeps register and memory bit strings exact along the way.
 */
export function decodeBitImmediate(memory, rip, cursor, opcode, rex) {
	if (opcode !== 0xba) {
		return null;
	}
	const modrm = memory.u8(cursor + 2);
	const operation = OPERATIONS[(modrm >> 3) & 7];
	if (!operation) {
		throw decoderBoundary("PORTABLE_X64_BIT_IMMEDIATE_GROUP", rip);
	}
	const width = operandWidth(rex);
	if ((modrm >> 6) === 3) {
		return decodedInstruction("bit_imm", rip, cursor + 4, {
			immediate: memory.u8(cursor + 3),
			operation,
			target: (modrm & 7) + ((rex & 1) ? 8 : 0),
			targetKind: "register",
			width
		});
	}
	const decoded = decodeAddressSpecification(
		memory,
		rip,
		cursor + 3,
		modrm,
		rex
	);
	return decodedInstruction("bit_imm", rip, decoded.next + 1, {
		address: decoded.address,
		immediate: memory.u8(decoded.next),
		operation,
		targetKind: "memory",
		width
	});
}
