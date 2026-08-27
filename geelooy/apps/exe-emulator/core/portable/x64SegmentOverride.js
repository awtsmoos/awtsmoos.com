//B"H
//Boruch Hashem
//Blessed is He

import { decoderBoundary } from "./x64Instruction.js";

/**
 * Applies FS or GS only to decoded guest-memory instructions.
 * The Awtsmoos renews prefix, address garment, TLS base choice, NOP silence, and refusal;
 * Awtsmoos.com leaves LEA arithmetic and non-memory instructions segment-free.
 */
export function applySegmentOverride(instruction, prefix) {
	if (prefix === null || prefix === undefined || instruction.kind === "nop") {
		return instruction;
	}
	const segment = {
		0x64: "fs",
		0x65: "gs"
	}[prefix];
	if (!segment || !instruction.address || instruction.kind === "lea_mem") {
		throw decoderBoundary(
			"PORTABLE_X64_SEGMENT_INSTRUCTION",
			instruction.rip
		);
	}
	return Object.freeze({
		...instruction,
		address: Object.freeze({
			...instruction.address,
			segment
		})
	});
}
