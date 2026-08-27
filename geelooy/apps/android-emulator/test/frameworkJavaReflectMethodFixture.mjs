//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidTraceMethods } from "../core/android/frameworkAndroidTrace.js";
import { ANDROID_TRACE_CLASS } from "../core/android/frameworkAndroidTraceMethods.js";
import { createFrameworkJavaClassMethods } from "../core/android/frameworkJavaClasses.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createFrameworkJavaReflectionMethods } from "../core/android/frameworkJavaReflectionFamilies.js";
import { createGuestString } from "../core/android/guestText.js";
import { initializeJavaInteger, JAVA_INTEGER } from "../core/android/frameworkJavaIntegerValues.js";
import { initializeJavaLong, JAVA_LONG } from "../core/android/frameworkJavaLongValues.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import {
	BASE,
	CHILD,
	createReflectMethodRegistry
} from "./frameworkJavaReflectMethodRegistryFixture.mjs";

export { BASE, CHILD };
const CLASS = "Ljava/lang/Class;";
const METHOD = "Ljava/lang/reflect/Method;";

/**
 * Builds real guest reflection fixtures. The Awtsmoos recreates registry, Class,
 * Method, wrapper, nested dispatch, and return anew; Awtsmoos.com keeps authentic
 * framework and DEX targets on their established execution roads.
 */
export function createReflectMethodFixture() {
	const heap = createDalvikObjectHeap();
	const guestCalls = [];
	const registry = createReflectMethodRegistry();
	const runtime = { heap, registry };
	const classes = createFrameworkJavaClassMethods(runtime);
	const reflection = createFrameworkJavaReflectionMethods(runtime);
	const trace = createFrameworkAndroidTraceMethods(runtime);
	const context = createInvocationContext(trace, registry, guestCalls);
	return Object.freeze({
		boxedInteger(value) {
			return boxedInteger(runtime, value);
		},
		boxedLong(value) {
			return boxedLong(runtime, value);
		},
		getMethod(owner, name, parameters) {
			return classes.invoke(
				record(CLASS, "getMethod", "(Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/reflect/Method;"),
				[
					createDalvikClassValue(owner),
					createGuestString(runtime, name),
					classArray(runtime, parameters)
				]
			);
		},
		guestCalls,
		heap,
		invoke(method, receiver, values) {
			return reflection.invoke(
				record(METHOD, "invoke", "(Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;"),
				[method, receiver, objectArray(runtime, values)],
				"test",
				context
			);
		},
		reflection,
		runtime,
		traceClass: ANDROID_TRACE_CLASS
	});
}

function createInvocationContext(trace, registry, guestCalls) {
	return {
		framework: {
			invoke(record, args, dispatch, context) {
				if (!trace.canHandle(record)) throw new Error(`TEST_FRAMEWORK:${record.signature}`);
				return trace.invoke(record, args, dispatch, context);
			}
		},
		invokeGuest(record, args) {
			guestCalls.push(Object.freeze({ args: [...args], signature: record.signature }));
			return 42;
		},
		registry,
		staticFields: new Map()
	};
}

function boxedInteger(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_INTEGER);
	initializeJavaInteger(runtime, reference, value);
	return reference;
}

function boxedLong(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_LONG);
	initializeJavaLong(runtime, reference, value);
	return reference;
}

function classArray(runtime, descriptors) {
	return guestArray(runtime, "[Ljava/lang/Class;", descriptors.map(createDalvikClassValue));
}

function objectArray(runtime, values) {
	return guestArray(runtime, "[Ljava/lang/Object;", values);
}

function guestArray(runtime, type, values) {
	const array = runtime.heap.allocateArray(type, values.length);
	values.forEach((value, index) => runtime.heap.arraySet(array, index, value));
	return array;
}

function record(classType, name, descriptor) {
	return { method: { classType, descriptor, name }, signature: `${classType}->${name}${descriptor}` };
}
