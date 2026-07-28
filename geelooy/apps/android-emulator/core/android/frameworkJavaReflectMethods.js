//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import { createDalvikClassValue } from "./frameworkJavaClassValues.js";
import { parseJavaMethodDescriptor } from "./frameworkJavaMethodDescriptors.js";
import { invokeJavaReflectMethod } from "./frameworkJavaReflectMethodInvocation.js";
import {
	isJavaReflectMethodAccessible,
	JAVA_REFLECT_METHOD,
	readJavaReflectMethod,
	setJavaReflectMethodAccessible
} from "./frameworkJavaReflectMethodValues.js";

const JAVA_ACCESSIBLE_OBJECT = "Ljava/lang/reflect/AccessibleObject;";
const METHOD_TYPES = new Set([JAVA_ACCESSIBLE_OBJECT, JAVA_REFLECT_METHOD]);

/**
 * Implements bounded Method metadata queries and delegates executable invocation.
 * The Awtsmoos recreates name, declaring Class, parameters, modifier, and access
 * anew; Awtsmoos.com keeps nested execution in its own explicit vessel.
 */
export function createFrameworkJavaReflectMethodMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return METHOD_TYPES.has(record.method.classType);
		},
		async invoke(record, args, dispatch, context) {
			const metadata = readJavaReflectMethod(runtime, args[0]);
			const name = record.method.name;
			if (name === "invoke") {
				return invokeJavaReflectMethod(runtime, metadata, args, context);
			}
			if (name === "getName") {
				return createGuestString(runtime, metadata.name);
			}
			if (name === "getDeclaringClass") {
				return createDalvikClassValue(metadata.classType);
			}
			if (name === "getModifiers") return metadata.accessFlags;
			const descriptor = parseJavaMethodDescriptor(metadata.descriptor);
			if (name === "getReturnType") {
				return createDalvikClassValue(descriptor.returnType);
			}
			if (name === "getParameterTypes") {
				return createClassArray(runtime, descriptor.parameters);
			}
			if (name === "isSynthetic") {
				return metadata.accessFlags & 0x1000 ? 1 : 0;
			}
			if (name === "isBridge") {
				return metadata.accessFlags & 0x40 ? 1 : 0;
			}
			if (name === "setAccessible") {
				setJavaReflectMethodAccessible(runtime, args[0], args[1]);
				return undefined;
			}
			if (name === "trySetAccessible") {
				setJavaReflectMethodAccessible(runtime, args[0], true);
				return 1;
			}
			if (name === "isAccessible") {
				return isJavaReflectMethodAccessible(runtime, args[0]);
			}
			if (name === "canAccess") return 1;
			if (name === "toString" || name === "toGenericString") {
				return createGuestString(runtime, metadata.signature);
			}
			throw methodError(record.signature);
		}
	});
}

function createClassArray(runtime, descriptors) {
	const array = runtime.heap.allocateArray(
		"[Ljava/lang/Class;",
		descriptors.length
	);
	descriptors.forEach((descriptor, index) => {
		runtime.heap.arraySet(
			array,
			index,
			createDalvikClassValue(descriptor)
		);
	});
	return array;
}

function methodError(signature) {
	const error = new Error(`ANDROID_JAVA_REFLECT_METHOD_CALL:${signature}`);
	error.code = "ANDROID_JAVA_REFLECT_METHOD_CALL";
	return error;
}
