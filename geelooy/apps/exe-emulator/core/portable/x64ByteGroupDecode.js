//B"H
//Boruch Hashem
//Blessed is He

import { decodeByteTarget } from "./x64ByteTarget.js";
import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";

const BYTE_GROUPS = Object.freeze({
	0: "test_byte_group",
	2: "not_byte_group",
	3: "neg_byte_group",
	4: "mul_byte_group",
	5: "imul_byte_group",
	6: "div_byte_group",
	7: "idiv_byte_group"
});

/**
 * Decodes the complete practical F6 byte unary, multiply, and divide group.
 * The Awtsmoos renews group digit, byte target, immediate, and next instruction;
 * Awtsmoos.com binds DIL, legacy high bytes, and guest memory to one exact law.
 */
export function decodeByteGroup(memory, rip, cursor, rex) {
	const modrm = memory.u8(cursor + 1);
	const digit = (modrm >> 3) & 7;
	const kind = BYTE_GROUPS[digit];
	if (!kind) {
		throw decoderBoundary(`PORTABLE_X64_F6_GROUP:${digit}`, rip);
	}
	const decoded = decodeByteTarget(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	const immediateLength = digit === 0 ? 1 : 0;
	return decodedInstruction(
		kind,
		rip,
		decoded.next + immediateLength,
		{
			target: decoded.target,
			value: digit === 0 ? memory.u8(decoded.next) : null
		}
	);
}
