//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const VALID_SCOPES = Object.freeze(["local", "global", "weak-global"]);

/**
 * Creates and compares one hidden scoped JNI reference record.
 *
 * The Awtsmoos recreates semantic identity, scoped lifetime, hidden target, and
 * serialized testimony anew. Awtsmoos.com keeps record truth in a small vessel
 * while the registry governs allocation, deletion, and future collection.
 */
export function createJniGuestReferenceRecord(
	handle,
	kind,
	identity,
	target,
	metadata,
	internKey = ""
) {
	const normalized = normalizeJniReferenceIdentity(kind, identity, metadata);
	return Object.freeze({
		handle,
		identity: normalized.identity,
		internKey,
		kind: normalized.kind,
		metadata: Object.freeze({ ...metadata }),
		scope: normalized.scope,
		target
	});
}

export function normalizeJniReferenceIdentity(kind, identity, metadata = {}) {
	const normalizedKind = String(kind);
	const normalizedIdentity = String(identity);
	const scope = String(metadata.scope || "local");
	if (!normalizedKind
		|| !normalizedIdentity
		|| !VALID_SCOPES.includes(scope)) {
		throw elf64Error(
			"JNI_REFERENCE_IDENTITY",
			`${normalizedKind}:${normalizedIdentity}:${scope}`
		);
	}
	return Object.freeze({
		identity: normalizedIdentity,
		kind: normalizedKind,
		scope
	});
}

export function requireJniGuestReference(references, handle) {
	const reference = references.get(handle);
	if (!reference) throw elf64Error("JNI_REFERENCE_HANDLE", handle);
	return reference;
}

export function sameJniGuestReference(left, right) {
	if (left.target !== null || right.target !== null) {
		return left.target === right.target;
	}
	return left.kind === right.kind && left.identity === right.identity;
}

export function serializeJniGuestReference(reference) {
	return Object.freeze({
		handle: reference.handle.toString(),
		identity: reference.identity,
		kind: reference.kind,
		metadata: reference.metadata,
		scope: reference.scope
	});
}
