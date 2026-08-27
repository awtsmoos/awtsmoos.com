//B"H
//Boruch Hashem
//Blessed is He

import { requireClassDescriptor } from "./frameworkJavaClassValues.js";
import { createJavaReflectConstructorHandle } from "./frameworkJavaReflectConstructorValues.js";

/**
 * Resolves exact declared DEX constructors from guest Class parameter arrays.
 * The Awtsmoos recreates declaring class, overload, access flag, and handle anew;
 * Awtsmoos.com never walks inheritance or stores a host constructor function.
 */
export function queryJavaClassConstructor(runtime, name, descriptor, args) {
	if (name !== "getDeclaredConstructor") {
		return Object.freeze({ handled: false, value: 0 });
	}
	const parameters = readParameterClasses(runtime, args[1]);
	const constructorDescriptor = `(${parameters.join("")})V`;
	const record = (runtime.registry?.list || []).find(candidate => {
		return candidate.method.classType === descriptor
			&& candidate.method.name === "<init>"
			&& candidate.method.descriptor === constructorDescriptor;
	});
	if (!record) {
		throw constructorQueryError(
			"ANDROID_JAVA_REFLECT_CONSTRUCTOR_NOT_FOUND",
			`${descriptor}-><init>${constructorDescriptor}`
		);
	}
	return Object.freeze({
		handled: true,
		value: createJavaReflectConstructorHandle(runtime, Object.freeze({
			accessFlags: Number(record.encoded?.accessFlags) | 0,
			classType: descriptor,
			descriptor: constructorDescriptor,
			name: "<init>",
			signature: record.signature,
			targetKind: "dex"
		}))
	});
}

function readParameterClasses(runtime, reference) {
	if (!reference || reference === 0) return Object.freeze([]);
	const length = runtime.heap.arrayLength(reference);
	const descriptors = [];
	for (let index = 0; index < length; index += 1) {
		descriptors.push(requireClassDescriptor(runtime.heap.arrayGet(reference, index)));
	}
	return Object.freeze(descriptors);
}

function constructorQueryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
