//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkPackageMethods } from "../core/android/frameworkPackages.js";
import { invokeJavaClassLoader } from "../core/android/frameworkJavaClassLoader.js";
import { systemClassLoader } from "../core/android/frameworkJavaClassRuntime.js";
import {
	isDalvikClassValue,
	requireClassDescriptor
} from "../core/android/frameworkJavaClassValues.js";
import { createGuestString } from "../core/android/guestText.js";
import {
	createDalvikObjectHeap,
	isDalvikReference
} from "../core/dalvik/objectHeap.js";

const CLASS_LOADER = "Ljava/lang/ClassLoader;";
const GET_CLASS_LOADER = "Landroid/content/Context;->getClassLoader()Ljava/lang/ClassLoader;";

/**
 * Proves every guest Context reveals the runtime's one bounded class loader.
 * The Awtsmoos joins Application and Context beneath one stable light;
 * Awtsmoos.com loads only guest-known classes and keeps host modules out of sight.
 */
test("Context returns one stable guest ClassLoader per runtime", () => {
	const firstRuntime = createRuntime();
	const firstFamily = createFrameworkPackageMethods(firstRuntime);
	const record = contextLoaderRecord();
	const application = firstRuntime.heap.allocate("Landroid/app/Application;");
	const context = firstRuntime.heap.allocate("Landroid/content/Context;");
	assert.equal(firstFamily.canHandle(record), true);
	const fromApplication = firstFamily.invoke(record, [application]);
	const fromContext = firstFamily.invoke(record, [context]);
	assert.equal(isDalvikReference(fromApplication), true);
	assert.equal(firstRuntime.heap.get(fromApplication).type, CLASS_LOADER);
	assert.equal(fromContext, fromApplication);
	assert.equal(systemClassLoader(firstRuntime), fromApplication);
	const secondRuntime = createRuntime();
	const secondLoader = createFrameworkPackageMethods(secondRuntime).invoke(
		record,
		[secondRuntime.heap.allocate("Landroid/app/Application;")]
	);
	assert.notEqual(secondLoader, fromApplication);
});

test("Context loader performs bounded guest class lookup", () => {
	const runtime = createRuntime();
	const loader = createFrameworkPackageMethods(runtime).invoke(
		contextLoaderRecord(),
		[runtime.heap.allocate("Landroid/app/Application;")]
	);
	const loaded = invokeJavaClassLoader(
		runtime,
		loadClassRecord(),
		[loader, createGuestString(runtime, "java.lang.String")]
	);
	assert.equal(isDalvikClassValue(loaded), true);
	assert.equal(requireClassDescriptor(loaded), "Ljava/lang/String;");
	assert.throws(
		() => invokeJavaClassLoader(
			runtime,
			loadClassRecord(),
			[loader, createGuestString(runtime, "example.missing.GuestClass")]
		),
		error => error.code === "ANDROID_CLASS_NOT_FOUND"
	);
});

function createRuntime() {
	return { heap: createDalvikObjectHeap() };
}

function contextLoaderRecord() {
	return {
		method: {
			classType: "Landroid/content/Context;",
			descriptor: "()Ljava/lang/ClassLoader;",
			name: "getClassLoader"
		},
		signature: GET_CLASS_LOADER
	};
}

function loadClassRecord() {
	return {
		method: {
			classType: CLASS_LOADER,
			descriptor: "(Ljava/lang/String;)Ljava/lang/Class;",
			name: "loadClass"
		},
		signature: `${CLASS_LOADER}->loadClass(Ljava/lang/String;)Ljava/lang/Class;`
	};
}
