//B"H
//Boruch Hashem
//Blessed is He

import { decodeAccumulatorByte } from "./x64AccumulatorDecode.js";
import { decodeAccumulatorImmediate } from "./x64AccumulatorImmediate.js";
import { decodeByteBinary } from "./x64ByteBinaryDecode.js";
import { decodeByteGroup } from "./x64ByteGroupDecode.js";
import { decodeByteInstruction } from "./x64ByteDecode.js";
import { decodeOperandPrimary } from "./x64OperandDecode.js";
import { decodeMovsxd } from "./x64SignExtension.js";
import { decodeSimplePrimary } from "./x64SimplePrimaryDecode.js";
import { decodeStringMove } from "./x64StringMoveDecode.js";
import { decodeTwoByte } from "./x64TwoByteDecode.js";

const BYTE_OPCODES = new Set([
	0x80,
	0x84,
	0x88,
	0x8a,
	0xc6
]);

/**
 * Coordinates bounded one-byte instruction families after prefix validation.
 * The Awtsmoos renews accumulator, strings, byte arithmetic, and operand roads;
 * Awtsmoos.com keeps each growing family in its own small decoder vessel.
 */
export function decodePrimaryX64(
	memory,
	rip,
	cursor,
	opcode,
	rex,
	mandatoryPrefix
) {
	const simple = decodeSimplePrimary(
		memory,
		rip,
		cursor,
		opcode,
		rex
	);
	if (simple) return simple;
	const stringMove = decodeStringMove(rip, cursor, opcode, rex);
	if (stringMove) return stringMove;
	const accumulatorWide = decodeAccumulatorImmediate(
		memory,
		rip,
		cursor,
		opcode,
		rex
	);
	if (accumulatorWide) return accumulatorWide;
	const accumulatorByte = decodeAccumulatorByte(
		memory,
		rip,
		cursor,
		opcode,
		rex
	);
	if (accumulatorByte) return accumulatorByte;
	const byteBinary = decodeByteBinary(
		memory,
		rip,
		cursor,
		opcode,
		rex
	);
	if (byteBinary) return byteBinary;
	if (opcode === 0xf6) {
		return decodeByteGroup(memory, rip, cursor, rex);
	}
	if (BYTE_OPCODES.has(opcode)) {
		return decodeByteInstruction(
			memory,
			rip,
			cursor,
			opcode,
			rex
		);
	}
	if (opcode === 0x63) {
		return decodeMovsxd(memory, rip, cursor, rex);
	}
	if (opcode === 0x0f) {
		return decodeTwoByte(
			memory,
			rip,
			cursor,
			rex,
			mandatoryPrefix
		);
	}
	return decodeOperandPrimary(
		memory,
		rip,
		cursor,
		opcode,
		rex
	);
}
