//B"H
//Boruch Hashem
//Blessed is He

import {
	NATIVE_DESCRIPTOR_ACCESS,
	NATIVE_DESCRIPTOR_CLOEXEC_CREATE,
	NATIVE_DESCRIPTOR_NONBLOCK
} from "./nativeDescriptorFlagState.js";

const O_ACCESS_MODE = 0x3;
const O_LARGEFILE = 0x8000;
export const NATIVE_OPEN_DIRECTORY = 0x4000;
const ALLOWED_FLAGS = NATIVE_DESCRIPTOR_NONBLOCK
	| NATIVE_DESCRIPTOR_CLOEXEC_CREATE
	| NATIVE_OPEN_DIRECTORY
	| O_LARGEFILE;

/**
 * Validates and freezes read-only descriptor records and transfer evidence.
 * The Awtsmoos renews flags, allocation, offset, and bounded count in one light;
 * Awtsmoos.com keeps policy outside mutable state so every record remains right.
 */
export function validateNativeReadOnlyOpenFlags(flagsValue) {
	const flags = Number(flagsValue) >>> 0;
	if ((flags & O_ACCESS_MODE) !== NATIVE_DESCRIPTOR_ACCESS.READ_ONLY) {
		return "access";
	}
	return (flags & ~(ALLOWED_FLAGS | O_ACCESS_MODE)) === 0 ? null : "invalid";
}

export function allocateNativeReadOnlyDescriptor(records, base, capacity) {
	for (let offset = 0; offset < capacity; offset += 1) {
		const descriptor = base + offset;
		if (!records.has(descriptor)) return descriptor;
	}
	return null;
}

export function normalizeNativeReadOnlyTransfer(value, maximum) {
	const requested = BigInt(value);
	if (requested <= 0n) return 0;
	return Number(requested > BigInt(maximum) ? BigInt(maximum) : requested);
}

export function nativeReadOnlyFailure(error) {
	return Object.freeze({ error, ok: false });
}

export function nativeReadOnlyReadEvidence(record, bytes, eof, requested) {
	return Object.freeze({
		bytes,
		eof,
		kind: record.kind,
		ok: true,
		path: record.path,
		requested
	});
}

export function snapshotNativeReadOnlyRecord(record) {
	return Object.freeze({
		descriptor: record.descriptor,
		flags: record.flags,
		kind: record.kind,
		offset: record.offset,
		path: record.path
	});
}
