//B"H
//Boruch Hashem
//Blessed is He

import { frameworkDeclaredFields } from "./frameworkJavaFrameworkFields.js";

export const JAVA_REFLECT_FIELD = "Ljava/lang/reflect/Field;";
const FIELD_ARRAY = "[Ljava/lang/reflect/Field;";
const METADATA = "java:reflect:field:metadata";
const ACCESSIBLE = "java:reflect:field:accessible";

/**
 * Binds guest Field handles to DEX or declared framework metadata. The Awtsmoos
 * recreates owner, name, type, modifier, and static garment anew; Awtsmoos.com
 * exposes no host reflection object and preserves canonical Dalvik signatures.
 */
export function createDeclaredJavaField(runtime, descriptor, name) {
	const metadata = declaredFieldMetadata(runtime, descriptor).find(field => {
		return field.name === String(name);
	});
	if (!metadata) {
		throw reflectFieldError(
			"ANDROID_JAVA_REFLECT_FIELD_NOT_FOUND",
			`${descriptor}->${name}`
		);
	}
	return createFieldHandle(runtime, metadata);
}

export function createDeclaredJavaFields(runtime, descriptor) {
	const fields = declaredFieldMetadata(runtime, descriptor).map(metadata => {
		return createFieldHandle(runtime, metadata);
	});
	const array = runtime.heap.allocateArray(FIELD_ARRAY, fields.length);
	fields.forEach((field, index) => runtime.heap.arraySet(array, index, field));
	return array;
}

export function readJavaReflectField(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_REFLECT_FIELD) {
		throw reflectFieldError("ANDROID_JAVA_REFLECT_FIELD_REQUIRED", object.type);
	}
	const metadata = runtime.heap.getField(reference, METADATA);
	if (!metadata || typeof metadata.signature !== "string") {
		throw reflectFieldError(
			"ANDROID_JAVA_REFLECT_FIELD_UNINITIALIZED",
			String(reference.id)
		);
	}
	return metadata;
}

export function setJavaReflectFieldAccessible(runtime, reference, accessible) {
	readJavaReflectField(runtime, reference);
	runtime.heap.setField(reference, ACCESSIBLE, Boolean(accessible));
}

export function isJavaReflectFieldAccessible(runtime, reference) {
	readJavaReflectField(runtime, reference);
	return runtime.heap.getField(reference, ACCESSIBLE) ? 1 : 0;
}

function declaredFieldMetadata(runtime, descriptor) {
	const definition = runtime.registry?.classDefinition(descriptor);
	if (!definition) {
		const framework = frameworkDeclaredFields(descriptor);
		if (framework.length) return framework;
		throw reflectFieldError(
			"ANDROID_JAVA_REFLECT_CLASS_NOT_FOUND",
			descriptor
		);
	}
	const data = definition.classData;
	return [
		...(data?.staticFields || []).map(encoded => fieldMetadata(encoded, true)),
		...(data?.instanceFields || []).map(encoded => fieldMetadata(encoded, false))
	];
}

function fieldMetadata(encoded, staticField) {
	const member = encoded.member;
	return Object.freeze({
		accessFlags: Number(encoded.accessFlags) | 0,
		classType: member.classType,
		name: member.name,
		signature: `${member.classType}->${member.name}:${member.type}`,
		staticField,
		type: member.type
	});
}

function createFieldHandle(runtime, metadata) {
	return runtime.heap.allocate(JAVA_REFLECT_FIELD, {
		[ACCESSIBLE]: false,
		[METADATA]: metadata
	});
}

function reflectFieldError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
