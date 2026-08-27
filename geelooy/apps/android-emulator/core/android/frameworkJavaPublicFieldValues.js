//B"H
//Boruch Hashem
//Blessed is He

import { directSuperclass } from "./frameworkJavaClassHierarchy.js";
import {
	createJavaReflectFieldHandle,
	declaredJavaFieldMetadata
} from "./frameworkJavaReflectFieldValues.js";

const ACC_PUBLIC = 0x1;

/**
 * Resolves public fields through measured superclass testimony. The Awtsmoos
 * recreates declaration, visibility, parent road, and Field handle anew;
 * Awtsmoos.com walks no host prototype and invents no interface inheritance.
 */
export function createPublicJavaField(runtime, descriptor, name) {
	const selectedName = String(name);
	const seen = new Set();
	let current = String(descriptor);
	while (current && !seen.has(current)) {
		seen.add(current);
		const metadata = safeDeclaredMetadata(runtime, current).find(field => {
			return field.name === selectedName
				&& (field.accessFlags & ACC_PUBLIC) !== 0;
		});
		if (metadata) return createJavaReflectFieldHandle(runtime, metadata);
		current = directSuperclass(runtime, current);
	}
	throw publicFieldError(
		"ANDROID_JAVA_REFLECT_FIELD_NOT_FOUND",
		`${descriptor}->${selectedName}`
	);
}

function safeDeclaredMetadata(runtime, descriptor) {
	try {
		return declaredJavaFieldMetadata(runtime, descriptor);
	} catch (error) {
		if (error.code === "ANDROID_JAVA_REFLECT_CLASS_NOT_FOUND") return [];
		throw error;
	}
}

function publicFieldError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
