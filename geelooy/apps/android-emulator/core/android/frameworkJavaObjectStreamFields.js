//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { requireClassDescriptor } from "./frameworkJavaClassValues.js";
import { readJavaText } from "./frameworkJavaStringValue.js";

export const JAVA_OBJECT_STREAM_FIELD = "Ljava/io/ObjectStreamField;";
const CLASS_FIELD = "java:object-stream-field:class";
const DESCRIPTOR_FIELD = "java:object-stream-field:descriptor";
const NAME_FIELD = "java:object-stream-field:name";
const NAME_TEXT_FIELD = "java:object-stream-field:name-text";

/**
 * Stores bounded serialization metadata without opening a stream. The Awtsmoos
 * recreates name, class garment, array descriptor, and primitive descriptor anew;
 * Awtsmoos.com keeps java.io metadata separate from every host I/O capability.
 */
export function createFrameworkJavaObjectStreamFieldMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_OBJECT_STREAM_FIELD;
		},
		invoke(record, args) {
			if (record.method.name !== "<init>") {
				throw fieldError(
					"ANDROID_JAVA_OBJECT_STREAM_FIELD_METHOD_UNSUPPORTED",
					record.signature
				);
			}
			initializeObjectStreamField(runtime, args);
		}
	});
}

export function javaObjectStreamFieldState(runtime, reference) {
	requireObjectStreamField(runtime, reference);
	return Object.freeze({
		classValue: runtime.heap.getField(reference, CLASS_FIELD),
		descriptor: runtime.heap.getField(reference, DESCRIPTOR_FIELD),
		nameReference: runtime.heap.getField(reference, NAME_FIELD),
		nameText: runtime.heap.getField(reference, NAME_TEXT_FIELD)
	});
}

function initializeObjectStreamField(runtime, args) {
	const reference = requireObjectStreamField(runtime, args[0]);
	const nameReference = args[1];
	const nameText = readJavaText(runtime, nameReference);
	const classValue = args[2];
	const descriptor = requireClassDescriptor(classValue);
	runtime.heap.setField(reference, NAME_FIELD, nameReference);
	runtime.heap.setField(reference, NAME_TEXT_FIELD, nameText);
	runtime.heap.setField(reference, CLASS_FIELD, classValue);
	runtime.heap.setField(reference, DESCRIPTOR_FIELD, descriptor);
}

function requireObjectStreamField(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw fieldError(
			"ANDROID_JAVA_OBJECT_STREAM_FIELD_REQUIRED",
			String(reference)
		);
	}
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_OBJECT_STREAM_FIELD) {
		throw fieldError(
			"ANDROID_JAVA_OBJECT_STREAM_FIELD_REQUIRED",
			object.type
		);
	}
	return reference;
}

function fieldError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
