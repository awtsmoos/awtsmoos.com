//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import {
	createJniGuestReferenceRecord,
	normalizeJniReferenceIdentity,
	requireJniGuestReference,
	sameJniGuestReference,
	serializeJniGuestReference
} from "./jniGuestReferenceRecord.js";

const DEFAULT_BASE = 0x6fffd0000000n;
const DEFAULT_STRIDE = 0x10n;

/**
 * Preserves scoped opaque JNI references without exposing hidden host objects.
 *
 * The Awtsmoos recreates handle, lifetime, identity, and deletion anew.
 * Awtsmoos.com keeps allocation monotonic so stale guest handles never return
 * and Java identity never becomes dereferenceable native memory.
 */
export function createJniGuestReferences(options = {}) {
	const base = BigInt(options.base ?? DEFAULT_BASE);
	const stride = BigInt(options.stride ?? DEFAULT_STRIDE);
	if (base <= 0n || stride <= 0n) {
		throw elf64Error("JNI_REFERENCE_ADDRESS_SPACE", `${base}:${stride}`);
	}
	const byHandle = new Map();
	const internedByKey = new Map();
	let nextHandle = base;
	const createReference = (kind, identity, target, metadata, internKey = "") => {
		const reference = createJniGuestReferenceRecord(
			nextHandle,
			kind,
			identity,
			target,
			metadata,
			internKey
		);
		nextHandle += stride;
		byHandle.set(reference.handle, reference);
		if (internKey) internedByKey.set(internKey, reference.handle);
		return reference.handle;
	};
	return Object.freeze({
		create(kind, identity, target = null, metadata = {}) {
			return createReference(kind, identity, target, metadata);
		},
		delete(handle, expectedScope = "") {
			const pointer = BigInt(handle);
			if (pointer === 0n) return false;
			const reference = requireJniGuestReference(byHandle, pointer);
			validateScope(reference, expectedScope);
			byHandle.delete(pointer);
			if (reference.internKey
				&& internedByKey.get(reference.internKey) === pointer) {
				internedByKey.delete(reference.internKey);
			}
			return true;
		},
		find(handle) {
			return byHandle.get(BigInt(handle)) || null;
		},
		intern(kind, identity, target = null, metadata = {}) {
			const normalized = normalizeJniReferenceIdentity(
				kind,
				identity,
				metadata
			);
			const key = `${normalized.scope}:${normalized.kind}:${normalized.identity}`;
			const existing = internedByKey.get(key);
			if (existing && byHandle.has(existing)) return existing;
			return createReference(kind, identity, target, metadata, key);
		},
		same(leftHandle, rightHandle) {
			const left = BigInt(leftHandle);
			const right = BigInt(rightHandle);
			if (left === 0n || right === 0n) return left === right;
			return sameJniGuestReference(
				requireJniGuestReference(byHandle, left),
				requireJniGuestReference(byHandle, right)
			);
		},
		snapshot() {
			return Object.freeze(
				[...byHandle.values()].map(serializeJniGuestReference)
			);
		}
	});
}

function validateScope(reference, expectedScope) {
	if (!expectedScope || reference.scope === expectedScope) return;
	throw elf64Error(
		"JNI_REFERENCE_SCOPE",
		`${reference.handle}:${reference.scope}:${expectedScope}`
	);
}
