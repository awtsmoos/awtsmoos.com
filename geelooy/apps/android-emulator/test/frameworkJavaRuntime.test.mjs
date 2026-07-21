//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaClassMethods } from "../core/android/frameworkJavaClasses.js";
import { JAVA_RUNTIME } from "../core/android/frameworkJavaRuntime.js";
import { normalizeAndroidProcessorCount } from "../core/android/runtimeProcessProfile.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CLASS = "Ljava/lang/Class;";
const CLASS_LOADER = "Ljava/lang/ClassLoader;";

/**
 * Proves the bounded virtual process Runtime used by Firebase executor sizing.
 * The Awtsmoos recreates singleton, capacity, receiver, and forbidden doorway;
 * Awtsmoos.com reveals no host process, shell, shutdown, or CPU topology.
 */
test("Android processor profile is deterministic and bounded", () => {
	assert.equal(normalizeAndroidProcessorCount(undefined), 4);
	assert.equal(normalizeAndroidProcessorCount(Number.NaN), 4);
	assert.equal(normalizeAndroidProcessorCount(6.9), 6);
	assert.equal(normalizeAndroidProcessorCount(0), 1);
	assert.equal(normalizeAndroidProcessorCount(-12), 1);
	assert.equal(normalizeAndroidProcessorCount(1000), 256);
});

test("java.lang.Runtime is stable and reports virtual processors", () => {
	const heap = createDalvikObjectHeap();
	const runtime = { availableProcessors: 12, heap };
	const family = createFrameworkJavaClassMethods(runtime);
	const getRuntime = record(
		JAVA_RUNTIME,
		"getRuntime",
		"()Ljava/lang/Runtime;"
	);
	const first = family.invoke(getRuntime, []);
	const second = family.invoke(getRuntime, []);
	assert.equal(first, second);
	assert.equal(heap.get(first).type, JAVA_RUNTIME);
	assert.equal(family.invoke(record(
		JAVA_RUNTIME,
		"availableProcessors",
		"()I"
	), [first]), 12);
	assert.equal(family.canHandle(record(CLASS, "getName", "()Ljava/lang/String;")), true);
	assert.equal(family.canHandle(record(CLASS_LOADER, "getSystemClassLoader", "()Ljava/lang/ClassLoader;")), true);
});

test("java.lang.Runtime rejects forged receivers and host-power methods", () => {
	const heap = createDalvikObjectHeap();
	const runtime = { availableProcessors: 4, heap };
	const family = createFrameworkJavaClassMethods(runtime);
	const forged = heap.allocate("Ljava/lang/Object;");
	assert.throws(
		() => family.invoke(record(
			JAVA_RUNTIME,
			"availableProcessors",
			"()I"
		), [forged]),
		error => error.code === "ANDROID_JAVA_RUNTIME_REQUIRED"
	);
	assert.throws(
		() => family.invoke(record(
			JAVA_RUNTIME,
			"exec",
			"(Ljava/lang/String;)Ljava/lang/Process;"
		), [forged, 0]),
		error => error.code === "ANDROID_JAVA_RUNTIME_METHOD_UNSUPPORTED"
	);
});

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
