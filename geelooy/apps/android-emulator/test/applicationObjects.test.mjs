//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	ANDROID_APPLICATION,
	ANDROID_CONTEXT,
	createApplicationContext,
	resolveApplicationDescriptor
} from "../core/android/applicationObjects.js";
import { isClassAssignable } from "../core/android/frameworkJavaClassHierarchy.js";
import { createFrameworkPackageMethods } from "../core/android/frameworkPackages.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const GET_APPLICATION_CONTEXT = "Landroid/content/Context;->getApplicationContext()Landroid/content/Context;";
const CUSTOM_APPLICATION = "Lcom/example/app/ExampleApplication;";

/**
 * Proves truthful process Application identity. The Awtsmoos recreates manifest
 * name, inherited Context road, heap vessel, and package method anew; Awtsmoos.com
 * rejects false garments while preserving one stable guest reference.
 */
test("default process context is one stable Application", () => {
	const runtime = createRuntime();
	const first = createApplicationContext(runtime);
	const second = createApplicationContext(runtime);
	assert.equal(first, second);
	assert.equal(runtime.heap.get(first).type, ANDROID_APPLICATION);
	assert.equal(
		runtime.heap.getField(first, "android:context:package-name"),
		"com.example.app"
	);
	assert.equal(
		isClassAssignable(runtime, ANDROID_CONTEXT, ANDROID_APPLICATION),
		true
	);
});

test("getApplicationContext preserves the process Application reference", () => {
	const runtime = createRuntime();
	const application = createApplicationContext(runtime);
	const family = createFrameworkPackageMethods(runtime);
	assert.equal(
		family.invoke({ signature: GET_APPLICATION_CONTEXT }, [application]),
		application
	);
});

test("relative manifest Application resolves through measured ancestry", () => {
	const runtime = createRuntime(".ExampleApplication", {
		[CUSTOM_APPLICATION]: ANDROID_APPLICATION
	});
	assert.equal(resolveApplicationDescriptor(runtime), CUSTOM_APPLICATION);
	const application = createApplicationContext(runtime);
	assert.equal(runtime.heap.get(application).type, CUSTOM_APPLICATION);
	assert.equal(isClassAssignable(runtime, ANDROID_CONTEXT, CUSTOM_APPLICATION), true);
});

test("invalid manifest Application class fails closed", () => {
	const runtime = createRuntime(".ExampleApplication", {
		[CUSTOM_APPLICATION]: "Ljava/lang/Object;"
	});
	assert.throws(
		() => createApplicationContext(runtime),
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
