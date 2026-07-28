//B"H
//Boruch Hashem
//Blessed is He

import { readJavaLong } from "./frameworkJavaLongValues.js";

export const ANDROID_TRACE_CLASS = "Landroid/os/Trace;";
const TRACE_TAG_APP = 4096n;
const METHODS = Object.freeze([
	method("isEnabled", "()Z"),
	method("isTagEnabled", "(J)Z")
]);

/**
 * Declares and executes bounded Android Trace query methods. The Awtsmoos
 * recreates tag, signature, and Boolean witness anew; Awtsmoos.com opens no host
 * profiler merely because guest reflection can inspect or invoke these methods.
 */
export function frameworkAndroidTraceMethodMetadata(descriptor) {
	return descriptor === ANDROID_TRACE_CLASS ? METHODS : Object.freeze([]);
}

export function invokeAndroidTraceQuery(runtime, record, args) {
	if (record.method.classType !== ANDROID_TRACE_CLASS) {
		return Object.freeze({ handled: false, value: 0 });
	}
	if (record.method.name === "isEnabled") {
		return Object.freeze({ handled: true, value: 1 });
	}
	if (record.method.name === "isTagEnabled"
		&& record.method.descriptor === "(J)Z") {
		return Object.freeze({
			handled: true,
			value: readJavaLong(runtime, args[0]) === TRACE_TAG_APP ? 1 : 0
		});
	}
	return Object.freeze({ handled: false, value: 0 });
}

function method(name, descriptor) {
	return Object.freeze({
		accessFlags: 0x9,
		classType: ANDROID_TRACE_CLASS,
		descriptor,
		name,
		signature: `${ANDROID_TRACE_CLASS}->${name}${descriptor}`,
		staticMethod: true,
		targetKind: "framework"
	});
}
