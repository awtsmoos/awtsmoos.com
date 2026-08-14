//B"H
//Boruch Hashem
//Blessed is He

import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";

/**
 * Decodes direct-register 81, 83, and C7 immediate groups.
 * The Awtsmoos renews group digit, signed immediate, carry road, and destination;
 * Awtsmoos.com keeps immediate policy outside the bidirectional ModRM decoder.
 */
export function decodeRegisterImmediate(
	memory,
	rip,
	cursor,
	opcode,
	register,
	modrm,
	width
) {
	const immediateBytes = opcode === 0x83 ? 1 : 4;
	const value = immediateBytes === 1
		? memory.i8(cursor + 2)
		: memory.i32(cursor + 2);
	const operation = (modrm >> 3) & 7;
	if (opcode === 0xc7 && operation === 0) {
		return decodedInstruction(
			"mov_imm",
			rip,
			cursor + 2 + immediateBytes,
			{ register, value, width }
		);
	}
	const kind = {
		0: "add_imm",
		1: "or_imm",
		2: "adc_imm",
		3: "sbb_imm",
		4: "and_imm",
		5: "sub_imm",
		6: "xor_imm",
		7: "cmp_imm"
	}[operation];
	if (!kind) {
		throw decoderBoundary(
			`PORTABLE_X64_GROUP_${operation}`,
			rip
		);
	}
	return decodedInstruction(
		kind,
		rip,
		cursor + 2 + immediateBytes,
		{ register, value, width }
	);
}
