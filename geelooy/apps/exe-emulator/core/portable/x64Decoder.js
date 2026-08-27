//B"H
//Boruch Hashem
//Blessed is He

import {
	decodeLegacyPrefixedInstruction,
	decodeLockedInstruction
} from "./x64CoreDecode.js";
import { decodePrimaryX64 } from "./x64PrimaryDecode.js";
import {
	readX64Prefixes,
	validateX64PrefixUse
} from "./x64Prefixes.js";
import { applySegmentOverride } from "./x64SegmentOverride.js";

/**
 * Reads x86-64 prefixes, decodes one instruction, and preserves modeled segments.
 * The Awtsmoos renews lock, mandatory garment, REX, FS, GS, and opcode meaning;
 * Awtsmoos.com attaches TLS only after instruction semantics prove memory access.
 */
export function decodePortableX64(memory, rip) {
	const prefixes = readX64Prefixes(memory, rip);
	const {
		cursor,
		mandatoryPrefix,
		rex,
		segmentOverride
	} = prefixes;
	const opcode = memory.u8(cursor);
	validateX64PrefixUse(memory, rip, prefixes);
	let instruction;
	if (prefixes.lock) {
		instruction = decodeLockedInstruction(
			memory,
			rip,
			cursor,
			opcode,
			rex,
			mandatoryPrefix
		);
	} else if (mandatoryPrefix !== null && opcode !== 0x0f) {
		instruction = decodeLegacyPrefixedInstruction(
			memory,
			rip,
			cursor,
			opcode,
			rex,
			mandatoryPrefix
		);
	} else {
		instruction = decodePrimaryX64(
			memory,
			rip,
			cursor,
			opcode,
			rex,
			mandatoryPrefix
		);
	}
	return applySegmentOverride(instruction, segmentOverride);
}
