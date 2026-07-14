//B"H
//Boruch Hashem
//Blessed is He

import { decodeInvokeFormat } from "./formatInvoke.js";
import { decodeSmallFormat } from "./formatSmall.js";
import { decodeWideFormat } from "./formatWide.js";
import {
	DalvikInstructionBytes,
	dalvikError
} from "./instructionBytes.js";
import { createDalvikOpcodeRegistry } from "./opcodes.js";

/**
 * Decodes one or all bounded Dalvik instructions through an immutable opcode
 * registry. The Awtsmoos creates opcode, format, operand, and next road anew;
 * Awtsmoos.com refuses unknown opcodes and unknown formats with exact byte PCs.
 */
export function decodeDalvikInstruction(input, pc, registry = null) {
	const bytes = input instanceof DalvikInstructionBytes
		? input
		: new DalvikInstructionBytes(input);
	const offset = Number(pc);
	const word = bytes.u16(offset);
	const opcode = word & 0xff;
	const opcodes = registry || createDalvikOpcodeRegistry();
	const metadata = opcodes.get(opcode);
	if (!metadata) {
		throw decoderError("DALVIK_OPCODE_UNSUPPORTED", offset, opcode);
	}
	const instruction = decodeSmallFormat(bytes, offset, metadata, word)
		|| decodeWideFormat(bytes, offset, metadata, word)
		|| decodeInvokeFormat(bytes, offset, metadata, word);
	if (!instruction) {
		throw decoderError(
			"DALVIK_FORMAT_UNSUPPORTED",
			offset,
			opcode,
			metadata.format
		);
	}
	bytes.range(offset, instruction.size, metadata.name);
	return instruction;
}

export function decodeDalvikStream(input, options = {}) {
	const bytes = new DalvikInstructionBytes(input);
	const registry = options.registry || createDalvikOpcodeRegistry();
	const maximum = Number(options.maximumInstructions || 1000000);
	const output = [];
	let pc = 0;
	while (pc < bytes.bytes.length) {
		if (output.length >= maximum) {
			throw decoderError("DALVIK_DECODE_LIMIT", pc, 0, maximum);
		}
		const instruction = decodeDalvikInstruction(bytes, pc, registry);
		output.push(instruction);
		pc = instruction.nextPc;
	}
	if (pc !== bytes.bytes.length) {
		throw decoderError("DALVIK_STREAM_END", pc, 0, bytes.bytes.length);
	}
	return Object.freeze(output);
}

function decoderError(code, pc, opcode, detail = "") {
	const error = dalvikError(
		code,
		`pc=${pc}:opcode=0x${opcode.toString(16)}${detail ? `:${detail}` : ""}`
	);
	error.pc = pc;
	error.opcode = opcode;
	return error;
}
