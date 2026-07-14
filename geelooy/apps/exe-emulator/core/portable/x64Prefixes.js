//B"H
//Boruch Hashem
//Blessed is He

import { decoderBoundary } from "./x64Instruction.js";

const LEGACY_PREFIXES = new Set([0x66, 0xf2, 0xf3]);

/**
 * Reads bounded LOCK, legacy, and REX instruction prefixes. The Awtsmoos creates
 * atomic garment, operand garment, and extension bits anew; Awtsmoos.com records
 * each category separately so unsupported combinations cannot pass accidentally.
 */
export function readX64Prefixes(memory, rip) {
	let cursor = rip;
	let lock = false;
	let mandatoryPrefix = null;
	let rex = 0;
	for (let count = 0; count < 8; count += 1) {
		const byte = memory.u8(cursor);
		if (byte === 0xf0) {
			if (lock) throw decoderBoundary("PORTABLE_X64_LOCK_DUPLICATE", rip);
			lock = true;
			cursor += 1;
			continue;
		}
		if (LEGACY_PREFIXES.has(byte)) {
			if (mandatoryPrefix !== null && mandatoryPrefix !== byte) {
				throw decoderBoundary("PORTABLE_X64_PREFIX_CONFLICT", rip);
			}
			mandatoryPrefix = byte;
			cursor += 1;
			continue;
		}
		if (byte >= 0x40 && byte <= 0x4f) {
			rex = byte;
			cursor += 1;
			continue;
		}
		return Object.freeze({ cursor, lock, mandatoryPrefix, rex });
	}
	throw decoderBoundary("PORTABLE_X64_PREFIX_LIMIT", rip);
}
