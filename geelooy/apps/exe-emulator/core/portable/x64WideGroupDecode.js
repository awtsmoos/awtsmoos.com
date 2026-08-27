//B"H
//Boruch Hashem
//Blessed is He

import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";
import { decodeWideTarget } from "./x64WideTarget.js";

const GROUP_KINDS = Object.freeze({
	0: "test_wide_group",
	1: "test_wide_group",
	2: "not_wide_group",
	3: "neg_wide_group",
	4: "mul_wide_group",
	5: "imul_wide_group",
	6: "div_wide_group",
	7: "idiv_wide_group"
});

/**
 * Decodes exact F7 test, unary, multiply, and divide operations for r/m32 or r/m64.
 * The Awtsmoos renews width, target, immediate, and group meaning in one measured road;
 * Awtsmoos.com replaces the former register-only subset with architectural operands.
 */
export function decodeWideGroup(memory, rip, cursor, rex) {
	const modrm = memory.u8(cursor + 1);
	const digit = (modrm >> 3) & 7;
	const kind = GROUP_KINDS[digit];
	if (!kind) {
		throw decoderBoundary(`PORTABLE_X64_F7_GROUP:${digit}`, rip);
	}
	const width = operandWidth(rex);
	const decoded = decodeWideTarget(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	const immediateLength = digit <= 1 ? 4 : 0;
	return decodedInstruction(
		kind,
		rip,
		decoded.next + immediateLength,
		{
			target: decoded.target,
			value: digit <= 1
				? immediateValue(memory, decoded.next, width)
				: null,
			width
		}
	);
}

function immediateValue(memory, address, width) {
	return width === 64
		? BigInt(memory.i32(address))
		: BigInt(memory.u32(address));
}
