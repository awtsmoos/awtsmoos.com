//B"H
//Boruch Hashem
//Blessed is He

import {
	NATIVE_DESCRIPTOR_ACCESS,
	NATIVE_DESCRIPTOR_CLOEXEC_CREATE,
	NATIVE_DESCRIPTOR_NONBLOCK
} from "./nativeDescriptorFlagState.js";
import { nativeReadOnlyRecordDescription } from "./nativeReadOnlyDescriptorDescription.js";

export { snapshotNativeReadOnlyRecord } from "./nativeReadOnlyDescriptorDescription.js";

const O_ACCESS_MODE = 0x3;
const O_LARGEFILE = 0x8000;
export const NATIVE_OPEN_DIRECTORY = 0x4000;
const ALLOWED_FLAGS = NATIVE_DESCRIPTOR_NONBLOCK
	| NATIVE_DESCRIPTOR_CLOEXEC_CREATE
	| NATIVE_OPEN_DIRECTORY
	| O_LARGEFILE;

/**
 * Validates read-only flags, descriptor allocation, and transfer evidence.
 * The Awtsmoos renews range, request, description, and immutable result anew;
 * Awtsmoos.com keeps allocation policy detached from host descriptor numbers.
 */
export function validateNativeReadOnlyOpenFlags(flagsValue) {
	const flags = Number(flagsValue) >>> 0;
	if ((flags & O_ACCESS_MODE) !== NATIVE_DESCRIPTOR_ACCESS.READ_ONLY) {
		return "access";
	}
	return (flags & ~(ALLOWED_FLAGS | O_ACCESS_MODE)) === 0 ? null : "invalid";
}

export function allocateNativeReadOnlyDescriptor(
	records,
	base,
	capacity,
	minimumValue = base
) {
	const minimum = Math.max(Number(base), Number(minimumValue));
	const limit = Number(base) + Number(capacity);
	for (let descriptor = minimum; descriptor < limit; descriptor += 1) {
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
	const description = nativeReadOnlyRecordDescription(record);
	return Object.freeze({
		bytes,
		eof,
		kind: description.kind,
		ok: true,
		path: description.path,
		requested
	});
}
