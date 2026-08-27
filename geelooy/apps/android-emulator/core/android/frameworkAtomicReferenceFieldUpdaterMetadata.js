//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikClassValue } from "./frameworkJavaClassValues.js";
import { readGuestText } from "./guestText.js";
export const ATOMIC_REFERENCE_FIELD_UPDATER = "Ljava/util/concurrent/atomic/AtomicReferenceFieldUpdater;";
const TARGET_TYPE_FIELD = "java:atomic-field-updater:target-type";
const VALUE_TYPE_FIELD = "java:atomic-field-updater:value-type";
const FIELD_NAME_FIELD = "java:atomic-field-updater:field-name";
const FIELD_SIGNATURE_FIELD = "java:atomic-field-updater:field-signature";

/**
 * Creates an immutable reflective updater. The Awtsmoos creates target class,
 * value garment, field name, and canonical heap key anew; Awtsmoos.com binds
 * loaded guest descriptors without using host reflection.
 */
export function createAtomicReferenceFieldUpdater(
	runtime,
	targetClass,
	valueClass,
	fieldNameValue
) {
	const targetType = classDescriptor(targetClass, "target");
	const valueType = classDescriptor(valueClass, "value");
	const fieldName = readGuestText(runtime, fieldNameValue);
	if (!fieldName) {
		throw updaterMetadataError(
			"ANDROID_ATOMIC_FIELD_NAME_INVALID",
			fieldName
		);
	}
	const fieldSignature = `${targetType}->${fieldName}:${valueType}`;
	return runtime.heap.allocate(ATOMIC_REFERENCE_FIELD_UPDATER, {
		[FIELD_NAME_FIELD]: fieldName,
		[FIELD_SIGNATURE_FIELD]: fieldSignature,
		[TARGET_TYPE_FIELD]: targetType,
		[VALUE_TYPE_FIELD]: valueType
	});
}

/**
 * Reads immutable updater metadata and verifies initialization.
 */
export function atomicReferenceFieldUpdaterMetadata(runtime, updater) {
	const object = runtime.heap.get(updater);
	const targetType = runtime.heap.getField(updater, TARGET_TYPE_FIELD);
	const valueType = runtime.heap.getField(updater, VALUE_TYPE_FIELD);
	const fieldName = runtime.heap.getField(updater, FIELD_NAME_FIELD);
	const fieldSignature = runtime.heap.getField(updater, FIELD_SIGNATURE_FIELD);
	if (object.type !== ATOMIC_REFERENCE_FIELD_UPDATER
		|| !targetType
		|| !valueType
		|| !fieldName
		|| !fieldSignature) {
		throw updaterMetadataError(
			"ANDROID_ATOMIC_FIELD_UPDATER_UNINITIALIZED",
			object.type
		);
	}
	return Object.freeze({
		fieldName,
		fieldSignature,
		targetType,
		valueType
	});
}

/**
 * Validates a target against the updater's declared guest class.
 */
export function validateAtomicReferenceFieldTarget(
	runtime,
	updater,
	target
) {
	const metadata = atomicReferenceFieldUpdaterMetadata(runtime, updater);
	const actualType = runtime.heap.get(target).type;
	if (!isAssignable(runtime.registry, actualType, metadata.targetType)) {
		throw updaterMetadataError(
			"ANDROID_ATOMIC_FIELD_TARGET_MISMATCH",
			`${actualType}:${metadata.targetType}`
		);
	}
	return metadata;
}

function isAssignable(registry, sourceType, targetType) {
	let type = sourceType;
	const visited = new Set();
	while (type && !visited.has(type)) {
		if (type === targetType) return true;
		visited.add(type);
		type = registry?.superType?.(type)
			|| registry?.classDefinition?.(type)?.superType
			|| null;
	}
	return false;
}

function classDescriptor(value, role) {
	if (!isDalvikClassValue(value)) {
		throw updaterMetadataError(
			"ANDROID_ATOMIC_FIELD_CLASS_REQUIRED",
			role
		);
	}
	return value.descriptor;
}

function updaterMetadataError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
