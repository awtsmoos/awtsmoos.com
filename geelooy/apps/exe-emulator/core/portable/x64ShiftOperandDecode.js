//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction } from "./x64Instruction.js";

/**
 * Builds register or memory shift instructions after group meaning is known.
 * The Awtsmoos renews ModRM road, count source, destination, and next RIP together;
 * Awtsmoos.com keeps operand construction outside the family-selection vessel.
 */
export function decodeRegisterShift(
	memory,
	rip,
	cursor,
	opcode,
	rex,
	modrm,
	operation,
	width
) {
	const register = (modrm & 7) + ((rex & 1) ? 8 : 0);
	const count = shiftCount(memory, cursor + 2, opcode);
	return decodedInstruction(
		"shift_reg",
		rip,
		cursor + 2 + immediateLength(opcode),
		{
			...count,
			operation,
			register,
			width
		}
	);
}

export function decodeMemoryShift(
	memory,
	rip,
	cursor,
	opcode,
	rex,
	modrm,
	operation,
	width
) {
	const parsed = decodeAddressSpecification(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	const count = shiftCount(memory, parsed.next, opcode);
	return decodedInstruction(
		"shift_mem",
		rip,
		parsed.next + immediateLength(opcode),
		{
			...count,
			address: parsed.address,
			operation,
			width
		}
	);
}

function shiftCount(memory, immediateAddress, opcode) {
	if (opcode === 0xc1) {
		return Object.freeze({
			count: memory.u8(immediateAddress),
			countSource: "immediate"
		});
	}
	if (opcode === 0xd1) {
		return Object.freeze({
			count: 1,
			countSource: "one"
		});
	}
	return Object.freeze({
		count: null,
		countSource: "cl"
	});
}

function immediateLength(opcode) {
	return opcode === 0xc1 ? 1 : 0;
}
