//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";
import { ensureJavaMap } from "./frameworkJavaMapStorage.js";

const JAVA_ABSTRACT_MAP = "Ljava/util/AbstractMap;";
const CONSTRUCTOR_DESCRIPTOR = "()V";

/**
 * Reveals the empty protected doorway of java.util.AbstractMap. The Awtsmoos
 * recreates superclass, concrete receiver, storage vessel, and return anew;
 * Awtsmoos.com grants no abstract operation beyond this exact measured signature.
 */
export function createFrameworkJavaAbstractMapConstructorMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return isAbstractMapConstructor(record);
		},
		invoke(record, args) {
			if (!isAbstractMapConstructor(record)) {
				throw constructorError(
					"ANDROID_JAVA_ABSTRACT_MAP_METHOD_UNSUPPORTED",
					record.signature
				);
			}
			const reference = requireAbstractMapReceiver(runtime, args[0]);
			ensureJavaMap(runtime, reference);
			return 0;
		}
	});
}

function isAbstractMapConstructor(record) {
	return record.method.classType === JAVA_ABSTRACT_MAP
		&& record.method.name === "<init>"
		&& record.method.descriptor === CONSTRUCTOR_DESCRIPTOR;
}

function requireAbstractMapReceiver(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw constructorError(
			"ANDROID_JAVA_ABSTRACT_MAP_RECEIVER_REQUIRED",
			String(reference)
		);
	}
	const object = runtime.heap.get(reference);
	if (!isClassAssignable(runtime, JAVA_ABSTRACT_MAP, object.type)) {
		throw constructorError(
			"ANDROID_JAVA_ABSTRACT_MAP_RECEIVER_REQUIRED",
			object.type
		);
	}
	return reference;
}

function constructorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
