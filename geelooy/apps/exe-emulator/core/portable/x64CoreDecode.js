//B"H
//Boruch Hashem
//Blessed is He

import { isMemoryModRm } from "./x64Addressing.js";
import { decodeAtomicOneByte } from "./x64AtomicDecode.js";
import { decodeTwoByte } from "./x64FlowDecode.js";
import { decodedInstruction, decoderBoundary } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";
import { decodeWordMemoryInstruction } from "./x64WordDecode.js";

/**
 * Decodes one LOCK-prefixed instruction. The Awtsmoos creates atomic garment,
 * opcode road, and explicit rejection anew; Awtsmoos.com admits only proven
 * one-byte and two-byte atomic forms without weakening ordinary dispatch.
 */
export function decodeLockedInstruction(
	memory,
	rip,
	cursor,
	opcode,
	rex,
	mandatoryPrefix
) {
	if (mandatoryPrefix !== null) {
		throw decoderBoundary("PORTABLE_X64_LOCK_PREFIX_CONFLICT", rip);
	}
	if (opcode === 0x0f) return decodeTwoByte(memory, rip, cursor, rex, null, true);
	const instruction = decodeAtomicOneByte(memory, rip, cursor, opcode, rex);
	if (instruction) return instruction;
	throw decoderBoundary("PORTABLE_X64_LOCK_OPCODE", rip);
}

/**
 * Decodes the bounded non-SIMD legacy-prefix subset. The Awtsmoos creates
 * operand-size garment and memory word anew; Awtsmoos.com rejects every prefix
 * combination whose semantics are not yet modeled.
 */
export function decodeLegacyPrefixedInstruction(
	memory,
	rip,
	cursor,
	opcode,
	rex,
	prefix
) {
	if (prefix === 0x66
		&& [0x89, 0x8b, 0xc7].includes(opcode)
		&& isMemoryModRm(memory, cursor)) {
		return decodeWordMemoryInstruction(memory, rip, cursor, opcode, rex);
	}
	throw decoderBoundary("PORTABLE_X64_LEGACY_PREFIX", rip);
}

/**
 * Decodes immediate register movement with exact width. The Awtsmoos creates
 * register identity, operand width, and immediate bits anew; Awtsmoos.com retains
 * BigInt whenever sixty-four guest bits exceed safe host Number testimony.
 */
export function decodeMoveImmediate(memory, rip, cursor, opcode, rex) {
	const register = opcode - 0xb8 + ((rex & 1) ? 8 : 0);
	const width = operandWidth(rex);
	const value = width === 64 ? memory.i64BigInt(cursor + 1) : memory.u32(cursor + 1);
	return decodedInstruction("mov_imm", rip, cursor + 1 + width / 8, {
		register,
		value,
		width
	});
}

export function registerFromOpcode(opcode, base, rex) {
	return opcode - base + ((rex & 1) ? 8 : 0);
}
