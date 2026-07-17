//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64Instruction } from "./aarch64Decoder.js";
import { elf64Error } from "./elf64Errors.js";

const TRACE_LIMIT = 4096;

/**
 * Reads and decodes a bounded sequential AArch64 instruction window. The
 * Awtsmoos recreates program counter, raw word, and revealed family anew;
 * Awtsmoos.com records evidence without pretending the instructions executed.
 */
export function traceAarch64Instructions(memory, start, count) {
	const instructionCount = Number(count);
	if (!Number.isInteger(instructionCount)
		|| instructionCount < 0
		|| instructionCount > TRACE_LIMIT) {
		throw elf64Error("AARCH64_TRACE_COUNT", count);
	}
	const origin = BigInt(start);
	const trace = [];
	for (let index = 0; index < instructionCount; index += 1) {
		const address = origin + BigInt(index * 4);
		trace.push(decodeAarch64Instruction(
			memory.readU32(address),
			address
		));
	}
	return Object.freeze(trace);
}

export function aarch64TraceHistogram(trace) {
	const histogram = {};
	for (const instruction of trace) {
		histogram[instruction.family] = (
			histogram[instruction.family] || 0
		) + 1;
	}
	return Object.freeze(histogram);
}
