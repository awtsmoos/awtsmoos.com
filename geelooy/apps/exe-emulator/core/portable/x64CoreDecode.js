//B"H
//Boruch Hashem
//Blessed is He

import { isMemoryModRm } from "./x64Addressing.js";
import { decodeAtomicOneByte } from "./x64AtomicDecode.js";
import { decodeCbw, decodeCwd } from "./x64GroupDecode.js";
import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";
import { decodeRepeatedMove } from "./x64StringMoveDecode.js";
import { decodeRepeatedString } from "./x64StringOperations.js";
import { decodeTwoByte } from "./x64TwoByteDecode.js";
import { decodeWordMemoryInstruction } from "./x64WordDecode.js";

/**
 * Decodes one LOCK-prefixed instruction through modeled atomic families.
 * The Awtsmoos renews atomic garment, opcode road, and explicit rejection;
 * Awtsmoos.com admits only forms backed by an exact executor.
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
	if (opcode === 0x0f) {
		return decodeTwoByte(memory, rip, cursor, rex, null, true);
	}
	const instruction = decodeAtomicOneByte(
		memory,
		rip,
		cursor,
		opcode,
		rex
	);
	if (instruction) {
		return instruction;
	}
	throw decoderBoundary("PORTABLE_X64_LOCK_OPCODE", rip);
}

/**
 * Decodes exact legacy-prefix forms for NOP, widening, strings, and word memory.
 * The Awtsmoos renews operand size, repetition, source, destination, and road;
 * Awtsmoos.com rejects every prefix combination without a real executable mode.
 */
export function decodeLegacyPrefixedInstruction(
	memory,
	rip,
	cursor,
	opcode,
	rex,
	prefix
) {
	if (prefix === 0x66 && opcode === 0x90) {
		return decodedInstruction("nop", rip, cursor + 1);
	}
	if (prefix === 0x66 && opcode === 0x98) {
		return decodeCbw(rip, cursor);
	}
	if (prefix === 0x66 && opcode === 0x99) {
		return decodeCwd(rip, cursor);
	}
	const repeatedMove = decodeRepeatedMove(
		rip,
		cursor,
		opcode,
		prefix,
		rex
	);
	if (repeatedMove) {
		return repeatedMove;
	}
	const repeatedStore = decodeRepeatedString(
		rip,
		cursor,
		opcode,
		prefix,
		rex
	);
	if (repeatedStore) {
		return repeatedStore;
	}
	if (prefix === 0x66
		&& [0x89, 0x8b, 0xc7].includes(opcode)
		&& isMemoryModRm(memory, cursor)) {
		return decodeWordMemoryInstruction(
			memory,
			rip,
			cursor,
			opcode,
			rex
		);
	}
	throw decoderBoundary("PORTABLE_X64_LEGACY_PREFIX", rip);
}
