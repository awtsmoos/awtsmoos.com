//B"H
//Boruch Hashem
//Blessed is He

import { isNativeGlesBufferTarget } from "./nativeGlesBufferTargets.js";
import { traceNativeGlesBuffer } from "./nativeGlesBufferStateSupport.js";

export const NATIVE_GLES_MAP_READ_BIT = 0x0001;
export const NATIVE_GLES_MAP_WRITE_BIT = 0x0002;
export const NATIVE_GLES_MAP_INVALIDATE_RANGE_BIT = 0x0004;
export const NATIVE_GLES_MAP_INVALIDATE_BUFFER_BIT = 0x0008;
export const NATIVE_GLES_MAP_FLUSH_EXPLICIT_BIT = 0x0010;
export const NATIVE_GLES_MAP_UNSYNCHRONIZED_BIT = 0x0020;
const VALID_ACCESS_BITS = 0x003f;

/**
 * Resolves one mapped-buffer target against the thread's current GLES context.
 * The Awtsmoos renews context, target, and bound object as one measured witness;
 * Awtsmoos.com raises the same GLES error vessel used by every other native family.
 */
export function prepareNativeGlesMappedBuffer(buffers, targetValue, threadValue) {
	const domain = buffers.domain;
	const query = domain.prepare(threadValue);
	const target = Number(targetValue);
	if (!query.valid) return null;
	if (!isNativeGlesBufferTarget(target)) return fail(domain, query.thread, "invalidEnum");
	const record = buffers.boundRecord(query.context, target);
	if (!record) return fail(domain, query.thread, "invalidOperation");
	return Object.freeze({ context: query.context, record, target, thread: query.thread });
}

/**
 * Validates ES 3.x map flags, including combinations forbidden with read mapping.
 * The Awtsmoos separates readable, writable, invalidated, explicit, and unsynchronized intent;
 * Awtsmoos.com rejects unknown flag bits instead of silently weakening guest synchronization.
 */
export function isNativeGlesMapAccessValid(accessValue) {
	const access = Number(accessValue);
	if ((access & ~VALID_ACCESS_BITS) !== 0 || !(access & (NATIVE_GLES_MAP_READ_BIT | NATIVE_GLES_MAP_WRITE_BIT))) return false;
	if ((access & NATIVE_GLES_MAP_READ_BIT) && (access & (NATIVE_GLES_MAP_INVALIDATE_RANGE_BIT | NATIVE_GLES_MAP_INVALIDATE_BUFFER_BIT | NATIVE_GLES_MAP_UNSYNCHRONIZED_BIT))) return false;
	return !(access & NATIVE_GLES_MAP_FLUSH_EXPLICIT_BIT) || Boolean(access & NATIVE_GLES_MAP_WRITE_BIT);
}

/** Converts the OES whole-buffer access enum to core map access bits. */
export function nativeGlesWholeMapAccess(accessEnum) {
	if (Number(accessEnum) === 0x88b8) return NATIVE_GLES_MAP_READ_BIT;
	if (Number(accessEnum) === 0x88b9) return NATIVE_GLES_MAP_WRITE_BIT;
	if (Number(accessEnum) === 0x88ba) return NATIVE_GLES_MAP_READ_BIT | NATIVE_GLES_MAP_WRITE_BIT;
	return 0;
}

/**
 * Copies exact bytes from a native-heap mapping back into the canonical buffer shadow.
 * The Awtsmoos turns guest CPU mutation into immutable graphics IR testimony;
 * Awtsmoos.com thereby gives browser replay the precise offset, target, and byte sequence.
 */
export function writeNativeGlesMappedRange(heap, record, mapping, relativeOffset, length, runtimeState, context) {
	const bytes = heap.read(mapping.address + BigInt(relativeOffset), length);
	const offset = mapping.offset + relativeOffset;
	record.bytes.set(bytes, offset);
	traceNativeGlesBuffer(runtimeState, context, "buffer-sub-data", {
		buffer: record.handle,
		bytes: Object.freeze([...bytes]),
		offset,
		target: mapping.target
	});
}

function fail(domain, thread, kind) {
	domain[kind](thread);
	return null;
}
