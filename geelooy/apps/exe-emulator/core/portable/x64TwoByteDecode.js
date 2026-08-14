//B"H
//Boruch Hashem
//Blessed is He

import { decodeAtomicTwoByte } from "./x64AtomicDecode.js";
import { decodeBitImmediate } from "./x64BitImmediateDecode.js";
import { decodeConditionalMove } from "./x64ConditionalMoveDecode.js";
import { decodeNearBranch } from "./x64FlowDecode.js";
import {
	decodedInstruction,
	decoderBoundary,
	unsupportedOpcode
} from "./x64Instruction.js";
import { decodeMultiByteNop } from "./x64NopDecode.js";
import { decodeSetCondition } from "./x64SetConditionDecode.js";
import { decodeSseTwoByte } from "./x64SseDecode.js";
import { decodeTwoByteData } from "./x64TwoByteDataDecode.js";

/**
 * Coordinates 0F-prefixed syscall, bit, data, branch, condition, and SIMD roads.
 * The Awtsmoos renews second opcode, lock law, prefix, and each decoder light;
 * Awtsmoos.com keeps two-byte growth distributed among small vessels of sight.
 */
export function decodeTwoByte(
	memory,
	rip,
	cursor,
	rex,
	mandatoryPrefix = null,
	lock = false
) {
	const opcode = memory.u8(cursor + 1);
	if (lock) {
		const atomic = decodeAtomicTwoByte(
			memory,
			rip,
			cursor,
			opcode,
			rex
		);
		if (atomic) {
			return atomic;
		}
		throw decoderBoundary("PORTABLE_X64_LOCK_TWO_BYTE", rip);
	}
	if (opcode === 0x05) {
		return decodedInstruction("syscall", rip, cursor + 2);
	}
	if (opcode === 0x1f) {
		return decodeMultiByteNop(memory, rip, cursor, rex);
	}
	const bitImmediate = decodeBitImmediate(
		memory,
		rip,
		cursor,
		opcode,
		rex
	);
	if (bitImmediate) {
		return bitImmediate;
	}
	const data = decodeTwoByteData(memory, rip, cursor, opcode, rex);
	if (data) {
		return data;
	}
	const setCondition = decodeSetCondition(
		memory,
		rip,
		cursor,
		opcode,
		rex
	);
	if (setCondition) {
		return setCondition;
	}
	const conditionalMove = decodeConditionalMove(
		memory,
		rip,
		cursor,
		opcode,
		rex,
		mandatoryPrefix
	);
	if (conditionalMove) {
		return conditionalMove;
	}
	const vector = decodeSseTwoByte(
		memory,
		rip,
		cursor,
		rex,
		mandatoryPrefix,
		opcode
	);
	if (vector) {
		return vector;
	}
	const branch = decodeNearBranch(memory, rip, cursor, opcode);
	if (branch) {
		return branch;
	}
	throw unsupportedOpcode(rip, opcode, "0f");
}
