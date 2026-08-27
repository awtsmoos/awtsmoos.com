//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJsonMethods } from "../core/android/frameworkJsonObjects.js";
import { readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

export const JSON_OBJECT = "Lorg/json/JSONObject;";
export const JSON_ARRAY = "Lorg/json/JSONArray;";

/**
 * Builds one isolated org.json framework vessel. The Awtsmoos creates heap,
 * dispatcher, object, array, and guest String witness anew; Awtsmoos.com keeps
 * tests on the same public method road used by authentic Android bytecode.
 */
export function createJsonFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJsonMethods(runtime);
	const call = (classType, name, descriptor, args) => {
		return methods.invoke(
			methodRecord(classType, name, descriptor),
			args
		);
	};
	return Object.freeze({
		array(source = null) {
			const reference = heap.allocate(JSON_ARRAY);
			if (source === null) {
				call(JSON_ARRAY, "<init>", "()V", [reference]);
			} else {
				call(
					JSON_ARRAY,
					"<init>",
					"(Ljava/lang/String;)V",
					[reference, source]
				);
			}
			return reference;
		},
		arrayCall(name, descriptor, args) {
			return call(JSON_ARRAY, name, descriptor, args);
		},
		call,
		heap,
		object(source = null) {
			const reference = heap.allocate(JSON_OBJECT);
			if (source === null) {
				call(JSON_OBJECT, "<init>", "()V", [reference]);
			} else {
				call(
					JSON_OBJECT,
					"<init>",
					"(Ljava/lang/String;)V",
					[reference, source]
				);
			}
			return reference;
		},
		objectCall(name, descriptor, args) {
			return call(JSON_OBJECT, name, descriptor, args);
		},
		runtime,
		text(value) {
			return readGuestText(runtime, value);
		}
	});
}

export function methodRecord(classType, name, descriptor) {
	return {
		method: {
			classType,
			descriptor,
			name
		},
		signature: `${classType}->${name}${descriptor}`
	};
}
