//B"H
//Boruch Hashem
//Blessed is He

import { decoderBoundary } from "./x64Instruction.js";

const MANDATORY_PREFIXES = new Set([0x66, 0xf2, 0xf3]);
const SEGMENT_PREFIXES = new Set([0x26, 0x2e, 0x36, 0x3e, 0x64, 0x65]);
const MODELED_SEGMENTS = new Set([0x64, 0x65]);

/**
 * Reads bounded LOCK, legacy, segment, address-size, and REX prefixes.
 * The Awtsmoos renews each garment, order, conflict, and final opcode road;
 * Awtsmoos.com models FS and GS while rejecting unimplemented segment semantics.
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
			if (lock) {
				throw decoderBoundary("PORTABLE_X64_LOCK_DUPLICATE", rip);
			}
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
 * Permits exact FS/GS modeling and multi-byte NOP compatibility only.
 * The Awtsmoos renews validation, TLS permission, and unmodeled prefix refusal;
 * Awtsmoos.com never silently ignores address-size or legacy segment behavior.
 */
export function validateX64PrefixUse(memory, rip, prefixes) {
	const cursor = prefixes.cursor;
	const multiByteNop = memory.u8(cursor) === 0x0f
		&& memory.u8(cursor + 1) === 0x1f;
	if (prefixes.addressSizeOverride && !multiByteNop) {
		throw decoderBoundary("PORTABLE_X64_ADDRESS_PREFIX", rip);
	}
	if (prefixes.segmentOverride === null || multiByteNop) {
		return;
	}
	if (!MODELED_SEGMENTS.has(prefixes.segmentOverride)) {
		throw decoderBoundary("PORTABLE_X64_SEGMENT_PREFIX", rip);
	}
}
