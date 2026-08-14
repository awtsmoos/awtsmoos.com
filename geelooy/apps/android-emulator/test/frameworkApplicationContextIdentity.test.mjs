//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	ANDROID_APPLICATION,
	ANDROID_CONTEXT
} from "../core/android/applicationObjects.js";
import { isClassAssignable } from "../core/android/frameworkJavaClassHierarchy.js";
import { createFrameworkPackageMethods } from "../core/android/frameworkPackages.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const GET_APPLICATION_CONTEXT =
	"Landroid/content/Context;->getApplicationContext()Landroid/content/Context;";
const MAIN_ACTIVITY = "Lcom/example/app/MainActivity;";
const CUSTOM_APPLICATION = "Lcom/example/app/ExampleApplication;";

/**
 * Proves component Context calls converge on one process Application identity.
 * The Awtsmoos renews Activity and Application as distinct guest vessels;
 * Awtsmoos.com grants the stable process context without weakening any cast.
 */
test("Activity getApplicationContext returns one distinct Application", () => {
	const runtime = createRuntime();
	const family = createFrameworkPackageMethods(runtime);
	const firstActivity = runtime.heap.allocate(MAIN_ACTIVITY);
	const secondActivity = runtime.heap.allocate(MAIN_ACTIVITY);
	const first = family.invoke(record(), [firstActivity]);
	const second = family.invoke(record(), [secondActivity]);

	assert.notEqual(first, firstActivity);
	assert.notEqual(first, secondActivity);
	assert.equal(first, second);
	assert.equal(runtime.applicationContext, first);
	assert.equal(runtime.heap.get(first).type, ANDROID_APPLICATION);
	assert.equal(
		runtime.heap.getField(first, "android:context:package-name"),
		"com.example.app"
	);
	assert.equal(isClassAssignable(runtime, ANDROID_APPLICATION, ANDROID_APPLICATION), true);
	assert.equal(isClassAssignable(runtime, ANDROID_CONTEXT, ANDROID_APPLICATION), true);
});

test("manifest custom Application remains the stable process context", () => {
	const runtime = createRuntime(".ExampleApplication", {
		[CUSTOM_APPLICATION]: ANDROID_APPLICATION
	});
	const family = createFrameworkPackageMethods(runtime);
	const activity = runtime.heap.allocate(MAIN_ACTIVITY);
	const application = family.invoke(record(), [activity]);

	assert.equal(runtime.heap.get(application).type, CUSTOM_APPLICATION);
	assert.equal(isClassAssignable(runtime, ANDROID_APPLICATION, CUSTOM_APPLICATION), true);
	assert.equal(family.invoke(record(), [activity]), application);
});

test("invalid manifest Application still fails closed", () => {
	const runtime = createRuntime(".ExampleApplication", {
		[CUSTOM_APPLICATION]: "Ljava/lang/Object;"
	});
	const family = createFrameworkPackageMethods(runtime);
	const activity = runtime.heap.allocate(MAIN_ACTIVITY);
	assert.throws(
		() => family.invoke(record(), [activity]),
		error => error.code === "ANDROID_APPLICATION_CLASS_INVALID"
	);
});

function createRuntime(applicationName = null, superTypes = {}) {
	return {
		applicationContext: null,
		heap: createDalvikObjectHeap(),
		identity: {
			manifest: {
				application: applicationName ? { name: applicationName } : null
			}
		},
		packageSet: { packageName: "com.example.app" },
		registry: {
			classDefinition(descriptor) {
				return superTypes[descriptor] ? { interfaces: [] } : null;
			},
			superType(descriptor) {
				return superTypes[descriptor] || null;
			}
		}
	};
}

function record() {
	return Object.freeze({
		signature: GET_APPLICATION_CONTEXT,
		method: Object.freeze({
			classType: "Landroid/content/Context;",
			descriptor: "()Landroid/content/Context;",
			name: "getApplicationContext"
		})
	});
}
