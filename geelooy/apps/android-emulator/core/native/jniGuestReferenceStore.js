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
 * Owns process-wide JNI identity while local intern handles remain pthread-bound.
 * The Awtsmoos lets two threads behold one Java identity through separate local light;
 * Awtsmoos.com keeps globals shared while every local reference retains its proper right.
 */
export function createJniGuestReferenceStore(options = {}) {
	const base = BigInt(options.base ?? DEFAULT_BASE);
	const stride = BigInt(options.stride ?? DEFAULT_STRIDE);
	if (base <= 0n || stride <= 0n) {
		throw elf64Error("JNI_REFERENCE_ADDRESS_SPACE", `${base}:${stride}`);
	}
	const byHandle = new Map();
	const internedByKey = new Map();
	const frames = options.frames;
	let nextHandle = base;
	const createReference = (kind, identity, target, metadata, threadKey, internKey = "") => {
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
		if (reference.scope === "local") frames.record(threadKey, reference.handle);
		return reference.handle;
	};
	const removeReference = (handle, expectedScope = "") => {
		const pointer = BigInt(handle);
		if (pointer === 0n) return false;
		const reference = requireJniGuestReference(byHandle, pointer);
		validateScope(reference, expectedScope);
		byHandle.delete(pointer);
		if (reference.internKey && internedByKey.get(reference.internKey) === pointer) {
			internedByKey.delete(reference.internKey);
		}
		return true;
	};
	return Object.freeze({
		create(kind, identity, target = null, metadata = {}, threadKey = 0n) {
			return createReference(kind, identity, target, metadata, threadKey);
		},
		delete(handle, expectedScope = "") {
			return removeReference(handle, expectedScope);
		},
		find(handle) {
			return byHandle.get(BigInt(handle)) || null;
		},
		intern(kind, identity, target = null, metadata = {}, threadKey = 0n) {
			const normalized = normalizeJniReferenceIdentity(kind, identity, metadata);
			const key = internKeyFor(normalized, threadKey);
			const existing = internedByKey.get(key);
			if (existing && byHandle.has(existing)) return existing;
			return createReference(kind, identity, target, metadata, threadKey, key);
		},
		require(handle) {
			return requireJniGuestReference(byHandle, BigInt(handle));
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
			return Object.freeze([...byHandle.values()].map(serializeJniGuestReference));
		}
	});
}

function internKeyFor(reference, threadKey) {
	const owner = reference.scope === "local"
		? `:${BigInt(threadKey ?? 0n)}`
		: "";
	return `${reference.scope}:${reference.kind}:${reference.identity}${owner}`;
}

function validateScope(reference, expectedScope) {
	if (!expectedScope || reference.scope === expectedScope) return;
	throw elf64Error("JNI_REFERENCE_SCOPE", `${reference.handle}:${reference.scope}:${expectedScope}`);
}
