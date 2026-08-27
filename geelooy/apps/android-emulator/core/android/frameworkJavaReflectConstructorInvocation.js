//B"H
//Boruch Hashem
//Blessed is He

import { parseJavaMethodDescriptor } from "./frameworkJavaMethodDescriptors.js";
import { readJavaReflectMethodArguments } from "./frameworkJavaMethodArguments.js";
import {
	isJavaReflectConstructorAccessible,
	readJavaReflectConstructor
} from "./frameworkJavaReflectConstructorValues.js";

/**
 * Allocates a guest receiver and executes its exact reflected DEX constructor.
 * The Awtsmoos recreates object, parameter garments, access, and nested call anew;
 * Awtsmoos.com invokes only registry testimony through existing guest authority.
 */
export async function invokeJavaReflectConstructor(
	runtime,
	context,
	constructorReference,
	argumentArray
) {
	const metadata = readJavaReflectConstructor(runtime, constructorReference);
	requireConstructorAccess(runtime, constructorReference, metadata);
	const parsed = parseJavaMethodDescriptor(metadata.descriptor);
	const parameters = readJavaReflectMethodArguments(
		runtime,
		argumentArray,
		parsed.parameters
	);
	const registry = context?.registry || runtime.registry;
	const target = registry?.bySignature(metadata.signature);
	if (!target || target.method.name !== "<init>") {
		throw constructorInvocationError(
			"ANDROID_JAVA_REFLECT_CONSTRUCTOR_TARGET_MISSING",
			metadata.signature
		);
	}
	if (typeof context?.invokeGuest !== "function") {
		throw constructorInvocationError(
			"ANDROID_JAVA_REFLECT_CONSTRUCTOR_GUEST_INVOKER_REQUIRED",
			metadata.signature
		);
	}
	const receiver = runtime.heap.allocate(metadata.classType);
	await context.invokeGuest(target, [receiver, ...parameters]);
	return receiver;
}

function requireConstructorAccess(runtime, reference, metadata) {
	const publicConstructor = Boolean(metadata.accessFlags & 0x1);
	if (publicConstructor || isJavaReflectConstructorAccessible(runtime, reference)) {
		return;
	}
	throw constructorInvocationError(
		"ANDROID_JAVA_REFLECT_CONSTRUCTOR_ACCESS",
		metadata.signature
	);
}

function constructorInvocationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
