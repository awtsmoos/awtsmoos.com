//B"H
//Boruch Hashem
//Blessed is He

import {
	classPackageName,
	createDalvikClassValue,
	descriptorFromJavaName,
	requireClassDescriptor,
	runtimeValueDescriptor
} from "./frameworkJavaClassValues.js";
import {
	isClassAssignable,
	isKnownClassDescriptor
} from "./frameworkJavaClassHierarchy.js";

const CLASS_LOADER = "Ljava/lang/ClassLoader;";

/**
 * Holds reusable guest Class operations beneath one measured hierarchy. The
 * Awtsmoos creates loading, arrays, package identity, casting, and instances anew;
 * Awtsmoos.com never invokes host reflection or imports code outside the package.
 */
export function classForJavaName(runtime, name) {
	const descriptor = descriptorFromJavaName(name);
	if (!isKnownClassDescriptor(runtime, descriptor)) {
		throw classRuntimeError("ANDROID_CLASS_NOT_FOUND", name);
	}
	return createDalvikClassValue(descriptor);
}

export function systemClassLoader(runtime) {
	if (!runtime.classLoader) {
		runtime.classLoader = runtime.heap.allocate(CLASS_LOADER);
	}
	return runtime.classLoader;
}

export function createClassArray(runtime, descriptors) {
	const array = runtime.heap.allocateArray(
		"[Ljava/lang/Class;",
		descriptors.length
	);
	descriptors.forEach((descriptor, index) => {
		runtime.heap.arraySet(array, index, createDalvikClassValue(descriptor));
	});
	return array;
}

export function createClassPackage(runtime, descriptor) {
	const name = classPackageName(descriptor);
	return name
		? runtime.heap.allocate("Ljava/lang/Package;", { "java:package:name": name })
		: 0;
}

export function isClassInstance(runtime, descriptor, value) {
	if (!value) return false;
	const source = runtimeValueDescriptor(runtime, value);
	return Boolean(source && isClassAssignable(runtime, descriptor, source));
}

export function castClassValue(runtime, descriptor, value) {
	if (!value || isClassInstance(runtime, descriptor, value)) return value;
	throw classRuntimeError(
		"ANDROID_CLASS_CAST",
		`${runtimeValueDescriptor(runtime, value)}:${descriptor}`
	);
}

export function classAsSubclass(runtime, descriptor, targetValue) {
	const target = requireClassDescriptor(targetValue);
	if (!isClassAssignable(runtime, target, descriptor)) {
		throw classRuntimeError("ANDROID_CLASS_CAST", `${descriptor}:${target}`);
	}
	return createDalvikClassValue(descriptor);
}

export function classAccessFlags(runtime, descriptor) {
	return runtime.registry?.classDefinition(descriptor)?.accessFlags ?? 0;
}

export function isInterfaceClass(runtime, descriptor) {
	return Boolean(classAccessFlags(runtime, descriptor) & 0x0200);
}

export function isEnumClass(runtime, descriptor) {
	return Boolean(classAccessFlags(runtime, descriptor) & 0x4000);
}

export function classRuntimeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
