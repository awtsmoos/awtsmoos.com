//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	createDalvikClassValue,
	javaClassName
} from "./frameworkJavaClassValues.js";
import { parseJavaMethodDescriptor } from "./frameworkJavaMethodDescriptors.js";
import { invokeJavaReflectConstructor } from "./frameworkJavaReflectConstructorInvocation.js";
import {
	isJavaReflectConstructorAccessible,
	JAVA_REFLECT_CONSTRUCTOR,
	readJavaReflectConstructor,
	setJavaReflectConstructorAccessible
} from "./frameworkJavaReflectConstructorValues.js";

const JAVA_ACCESSIBLE_OBJECT = "Ljava/lang/reflect/AccessibleObject;";
const CONSTRUCTOR_TYPES = new Set([
	JAVA_ACCESSIBLE_OBJECT,
	JAVA_REFLECT_CONSTRUCTOR
]);

/**
 * Implements Constructor metadata, accessibility, and exact guest instantiation.
 * The Awtsmoos recreates declaration, parameter garments, receiver, and call anew;
 * Awtsmoos.com grants no host reflection and invokes only measured DEX testimony.
 */
export function createFrameworkJavaReflectConstructorMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return CONSTRUCTOR_TYPES.has(record.method.classType);
		},
		async invoke(record, args, dispatch, context) {
			const name = record.method.name;
			const metadata = readJavaReflectConstructor(runtime, args[0]);
			if (name === "newInstance") {
				return invokeJavaReflectConstructor(runtime, context, args[0], args[1]);
			}
			if (name === "getDeclaringClass") {
				return createDalvikClassValue(metadata.classType);
			}
			if (name === "getName") {
				return createGuestString(runtime, javaClassName(metadata.classType));
			}
			if (name === "getModifiers") return metadata.accessFlags;
			if (name === "getParameterTypes") return parameterTypes(runtime, metadata);
			if (name === "isSynthetic") return metadata.accessFlags & 0x1000 ? 1 : 0;
			if (name === "setAccessible") {
				return setJavaReflectConstructorAccessible(runtime, args[0], args[1]);
			}
			if (name === "trySetAccessible") {
				setJavaReflectConstructorAccessible(runtime, args[0], true);
				return 1;
			}
			if (name === "isAccessible") {
				return isJavaReflectConstructorAccessible(runtime, args[0]);
			}
			if (name === "canAccess") return 1;
			if (name === "toString" || name === "toGenericString") {
				return constructorText(runtime, metadata);
			}
			throw constructorMethodError(record.signature);
		}
	});
}

function parameterTypes(runtime, metadata) {
	const parameters = parseJavaMethodDescriptor(metadata.descriptor).parameters;
	const array = runtime.heap.allocateArray("[Ljava/lang/Class;", parameters.length);
	parameters.forEach((type, index) => {
		runtime.heap.arraySet(array, index, createDalvikClassValue(type));
	});
	return array;
}

function constructorText(runtime, metadata) {
	const owner = javaClassName(metadata.classType);
	const parameters = parseJavaMethodDescriptor(metadata.descriptor).parameters;
	return createGuestString(runtime, `${owner}(${parameters.join(",")})`);
}

function constructorMethodError(signature) {
	const error = new Error(`ANDROID_JAVA_REFLECT_CONSTRUCTOR_METHOD:${signature}`);
	error.code = "ANDROID_JAVA_REFLECT_CONSTRUCTOR_METHOD";
	return error;
}
