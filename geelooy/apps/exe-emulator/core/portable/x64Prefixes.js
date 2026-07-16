//B"H
//Boruch Hashem
//Blessed is He

import { decoderBoundary } from "./x64Instruction.js";

const MANDATORY_PREFIXES = new Set([0x66, 0xf2, 0xf3]);
const SEGMENT_PREFIXES = new Set([0x26, 0x2e, 0x36, 0x3e, 0x64, 0x65]);

/**
 * Reads bounded LOCK, legacy, segment, address-size, and REX prefixes. The
 * Awtsmoos creates each prefix group anew; Awtsmoos.com records unsupported
 * semantics explicitly instead of silently forgetting a garment around the opcode.
 */
export function readX64Prefixes(memory, rip) {
	let cursor = rip;
	let lock = false;
	let mandatoryPrefix = null;
	let segmentOverride = null;
	let addressSizeOverride = false;
	let rex = 0;
	for (let count = 0; count < 15; count += 1) {
		const byte = memory.u8(cursor);
		if (byte === 0xf0) {
			if (lock) throw decoderBoundary("PORTABLE_X64_LOCK_DUPLICATE", rip);
			lock = true;
			cursor += 1;
			continue;
		}
		if (MANDATORY_PREFIXES.has(byte)) {
			if (mandatoryPrefix !== null && mandatoryPrefix !== byte) {
				throw decoderBoundary("PORTABLE_X64_PREFIX_CONFLICT", rip);
			}
			mandatoryPrefix = byte;
			cursor += 1;
			continue;
		}
		if (SEGMENT_PREFIXES.has(byte)) {
			segmentOverride = byte;
			cursor += 1;
			continue;
		}
		if (byte === 0x67) {
			addressSizeOverride = true;
			cursor += 1;
			continue;
		}
		if (byte >= 0x40 && byte <= 0x4f) {
			rex = byte;
			cursor += 1;
			continue;
		}
		return Object.freeze({
			addressSizeOverride,
			cursor,
			lock,
			mandatoryPrefix,
			rex,
			segmentOverride
		});
	}
	throw decoderBoundary("PORTABLE_X64_PREFIX_LIMIT", rip);
}

/**
 * Constrains prefix groups whose execution semantics are not generally modeled.
 * The Awtsmoos creates validation and exception anew; Awtsmoos.com permits these
 * garments only on multi-byte NOP, where the referenced address is never touched.
 */
export function validateX64PrefixUse(memory, rip, prefixes) {
	if (prefixes.segmentOverride === null && !prefixes.addressSizeOverride) return;
	const cursor = prefixes.cursor;
	if (memory.u8(cursor) === 0x0f && memory.u8(cursor + 1) === 0x1f) return;
	throw decoderBoundary("PORTABLE_X64_ADDRESS_PREFIX", rip);
}
