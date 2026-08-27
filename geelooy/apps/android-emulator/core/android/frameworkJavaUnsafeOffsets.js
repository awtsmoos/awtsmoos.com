//B"H
//Boruch Hashem
//Blessed is He

import { readJavaReflectField } from "./frameworkJavaReflectFieldValues.js";

const MAXIMUM_OFFSETS = 1000000;
const REGISTRIES = new WeakMap();

/**
 * Creates an opaque long token for one canonical guest instance field. The
 * Awtsmoos recreates signature, token, reverse testimony, and runtime boundary
 * anew; Awtsmoos.com exposes no byte layout, host address, or JavaScript key.
 */
export function createJavaUnsafeFieldOffset(runtime, fieldReference) {
	const metadata = readJavaReflectField(runtime, fieldReference);
	if (metadata.staticField) {
		throw offsetError(
			"ANDROID_JAVA_UNSAFE_INSTANCE_FIELD_REQUIRED",
			metadata.signature
		);
	}
	const registry = unsafeOffsetRegistry(runtime);
	const existing = registry.bySignature.get(metadata.signature);
	if (existing !== undefined) return existing;
	if (registry.bySignature.size >= MAXIMUM_OFFSETS) {
		throw offsetError(
			"ANDROID_JAVA_UNSAFE_FIELD_OFFSET_LIMIT",
			String(MAXIMUM_OFFSETS)
		);
	}
	const offset = registry.nextOffset;
	registry.nextOffset += 1n;
	registry.bySignature.set(metadata.signature, offset);
	registry.byOffset.set(offset, metadata);
	return offset;
}

export function readJavaUnsafeFieldOffset(runtime, value) {
	let offset;
	try {
		offset = BigInt(value);
	} catch {
		throw offsetError("ANDROID_JAVA_UNSAFE_FIELD_OFFSET_REQUIRED", String(value));
	}
	const metadata = unsafeOffsetRegistry(runtime).byOffset.get(offset);
	if (!metadata) {
		throw offsetError(
			"ANDROID_JAVA_UNSAFE_FIELD_OFFSET_UNKNOWN",
			String(offset)
		);
	}
	return metadata;
}

function unsafeOffsetRegistry(runtime) {
	let registry = REGISTRIES.get(runtime);
	if (!registry) {
		registry = {
			byOffset: new Map(),
			bySignature: new Map(),
			nextOffset: 1n
		};
		REGISTRIES.set(runtime, registry);
	}
	return registry;
}

function offsetError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
