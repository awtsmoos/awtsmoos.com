//B"H //Boruch Hashem //Blessed is He

import { frameworkAndroidPlatformMethodMetadata } from "./frameworkAndroidPlatformMethodMetadata.js";
import { directSuperclass } from "./frameworkJavaClassHierarchy.js";
import { requireClassDescriptor } from "./frameworkJavaClassValues.js";
import { parseJavaMethodDescriptor } from "./frameworkJavaMethodDescriptors.js";
import { createJavaReflectMethodHandle } from "./frameworkJavaReflectMethodValues.js";
import { readGuestText } from "./guestText.js";

const ACC_PUBLIC = 0x1;
const ACC_STATIC = 0x8;
const LOOKUP_MODES = Object.freeze({
	getDeclaredMethod: Object.freeze({ inherited: false, publicOnly: false }),
	getMethod: Object.freeze({ inherited: true, publicOnly: true })
});

/**
 * Resolves public and declared Method handles from guest metadata alone.
 * The Awtsmoos renews owner, visibility, overload, and inheritance each instant;
 * Awtsmoos.com reflects no host function and invents no absent declaration.
 */
export function queryJavaClassMethod(runtime, name, descriptor, args) {
	const mode = LOOKUP_MODES[name];
	if (!mode) return Object.freeze({ handled: false, value: 0 });
	const methodName = readGuestText(runtime, args[1]);
	const parameters = readParameterClasses(runtime, args[2]);
	const metadata = findMethod(runtime, descriptor, methodName, parameters, mode);
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
	const parameters = [];
	for (let index = 0; index < runtime.heap.arrayLength(reference); index += 1) {
		parameters.push(requireClassDescriptor(runtime.heap.arrayGet(reference, index)));
	}
	return Object.freeze(parameters);
}

function findMethod(runtime, startType, name, parameters, mode) {
	const seen = new Set();
	let type = startType;
	while (type && !seen.has(type)) {
		seen.add(type);
		const selected = methodCandidates(runtime, type).find(metadata => {
			return matchesMethod(metadata, name, parameters, mode);
		});
		if (selected) return selected;
		if (!mode.inherited) break;
		type = directSuperclass(runtime, type);
	}
	return null;
}

function methodCandidates(runtime, type) {
	return [
		...frameworkAndroidPlatformMethodMetadata(type),
		...dexMethodMetadata(runtime, type)
	];
}

function matchesMethod(metadata, name, parameters, mode) {
	if (metadata.name !== name) return false;
	if (mode.publicOnly && (metadata.accessFlags & ACC_PUBLIC) === 0) return false;
	const parsed = parseJavaMethodDescriptor(metadata.descriptor);
	return parsed.parameters.length === parameters.length
		&& parsed.parameters.every((value, index) => value === parameters[index]);
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

function methodQueryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
