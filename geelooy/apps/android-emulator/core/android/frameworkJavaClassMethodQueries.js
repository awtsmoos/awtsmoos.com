//B"H
//Boruch Hashem
//Blessed is He

import { frameworkAndroidTraceMethodMetadata } from "./frameworkAndroidTraceMethods.js";
import { directSuperclass } from "./frameworkJavaClassHierarchy.js";
import { requireClassDescriptor } from "./frameworkJavaClassValues.js";
import { readGuestText } from "./guestText.js";
import { parseJavaMethodDescriptor } from "./frameworkJavaMethodDescriptors.js";
import { createJavaReflectMethodHandle } from "./frameworkJavaReflectMethodValues.js";

const ACC_PUBLIC = 0x1;
const ACC_STATIC = 0x8;

/**
 * Resolves Class.getMethod through public DEX and bounded framework metadata. The
 * Awtsmoos recreates parameter Class, superclass road, and Method handle anew;
 * Awtsmoos.com traverses no host prototype and fabricates no missing overload.
 */
export function queryJavaClassMethod(runtime, name, descriptor, args) {
	if (name !== "getMethod") {
		return Object.freeze({ handled: false, value: 0 });
	}
	const methodName = readGuestText(runtime, args[1]);
	const parameters = readParameterClasses(runtime, args[2]);
	const metadata = findPublicMethod(runtime, descriptor, methodName, parameters);
	if (!metadata) {
		throw methodQueryError(
			"ANDROID_JAVA_REFLECT_METHOD_NOT_FOUND",
			`${descriptor}->${methodName}(${parameters.join("")})`
		);
	}
	return Object.freeze({
		handled: true,
		value: createJavaReflectMethodHandle(runtime, metadata)
	});
}

function readParameterClasses(runtime, reference) {
	if (!reference || reference === 0) return Object.freeze([]);
	const length = runtime.heap.arrayLength(reference);
	const parameters = [];
	for (let index = 0; index < length; index += 1) {
		parameters.push(requireClassDescriptor(runtime.heap.arrayGet(reference, index)));
	}
	return Object.freeze(parameters);
}

function findPublicMethod(runtime, startType, name, parameters) {
	const seen = new Set();
	let type = startType;
	while (type && !seen.has(type)) {
		seen.add(type);
		const candidates = [
			...frameworkAndroidTraceMethodMetadata(type),
			...dexMethodMetadata(runtime, type)
		];
		const selected = candidates.find(metadata => {
			const parsed = parseJavaMethodDescriptor(metadata.descriptor);
			return metadata.name === name
				&& (metadata.accessFlags & ACC_PUBLIC) !== 0
				&& sameParameters(parsed.parameters, parameters);
		});
		if (selected) return selected;
		type = directSuperclass(runtime, type);
	}
	return null;
}

function dexMethodMetadata(runtime, type) {
	return (runtime.registry?.list || []).filter(record => {
		return record.method.classType === type;
	}).map(record => {
		const accessFlags = Number(record.encoded?.accessFlags || 0) | 0;
		return Object.freeze({
			accessFlags,
			classType: record.method.classType,
			descriptor: record.method.descriptor,
			name: record.method.name,
			signature: record.signature,
			staticMethod: Boolean(accessFlags & ACC_STATIC),
			targetKind: "dex"
		});
	});
}

function sameParameters(left, right) {
	return left.length === right.length
		&& left.every((value, index) => value === right[index]);
}

function methodQueryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
