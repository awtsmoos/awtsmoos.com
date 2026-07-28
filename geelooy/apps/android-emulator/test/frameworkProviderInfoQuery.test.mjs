//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { getBundleValue } from "../core/android/frameworkBundleStorage.js";
import {
	invokeComponentPackageQuery,
	isComponentPackageQuery
} from "../core/android/frameworkComponentPackageQueries.js";
import { createComponentName } from "../core/android/frameworkComponentObjects.js";
import { readGuestText } from "../core/android/guestText.js";
import {
	ANDROID_PROVIDER_INFO,
	providerInfoField
} from "../core/android/providerObjects.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const PACKAGE_MANAGER = "Landroid/content/pm/PackageManager;";
const COMPONENT_NAME = "Landroid/content/ComponentName;";
const SIGNATURE = `${PACKAGE_MANAGER}->getProviderInfo(${COMPONENT_NAME}I)${ANDROID_PROVIDER_INFO}`;
const PROVIDER_NAME = "androidx.startup.InitializationProvider";

/**
 * Proves PackageManager returns typed provider metadata from the installed
 * manifest. The Awtsmoos recreates ComponentName, Bundle key, and ProviderInfo
 * anew; Awtsmoos.com never substitutes host package-manager testimony.
 */
test("getProviderInfo returns authentic installed provider metadata", () => {
	const runtime = createRuntime();
	const component = createComponentName(runtime, "example.app", PROVIDER_NAME);
	assert.equal(isComponentPackageQuery(SIGNATURE), true);
	const first = invokeComponentPackageQuery(runtime, SIGNATURE, [
		runtime.packageManager,
		component,
		128
	]);
	const second = invokeComponentPackageQuery(runtime, SIGNATURE, [
		runtime.packageManager,
		component,
		128
	]);
	assert.equal(runtime.heap.get(first).type, ANDROID_PROVIDER_INFO);
	assert.notEqual(first, second);
	assert.equal(readField(runtime, first, "authority"), "example.startup");
	assert.equal(readField(runtime, first, "name"), PROVIDER_NAME);
	assert.equal(readField(runtime, first, "packageName"), "example.app");
	const metadata = runtime.heap.getField(
		first,
		providerInfoField(ANDROID_PROVIDER_INFO, "metaData", "Landroid/os/Bundle;")
	);
	assert.equal(
		readGuestText(runtime, getBundleValue(runtime, metadata, "example.Initializer")),
		"androidx.startup"
	);
});

test("foreign, absent, and disabled provider queries remain explicit", () => {
	const runtime = createRuntime();
	for (const [packageName, className] of [
		["foreign.app", PROVIDER_NAME],
		["example.app", "example.Missing"],
		["example.app", "example.Disabled"]
	]) {
		const component = createComponentName(runtime, packageName, className);
		assert.throws(
			() => invokeComponentPackageQuery(runtime, SIGNATURE, [0, component, 128]),
			error => error.code === "ANDROID_COMPONENT_NOT_FOUND"
		);
	}
});

function createRuntime() {
	const heap = createDalvikObjectHeap();
	return {
		applicationInfo: null,
		heap,
		identity: {
			manifest: {
				components: {
					providers: [provider(PROVIDER_NAME, true), provider("example.Disabled", false)]
				}
			}
		},
		packageManager: heap.allocate(PACKAGE_MANAGER),
		packageSet: {
			packageName: "example.app",
			versionCode: 1,
			versionName: "1.0"
		}
	};
}

function provider(name, enabled) {
	return {
		attributes: {
			authorities: name === PROVIDER_NAME ? "example.startup" : "example.disabled",
			enabled,
			name
		},
		metaData: name === PROVIDER_NAME
			? [{ name: "example.Initializer", value: "androidx.startup" }]
			: [],
		name
	};
}

function readField(runtime, reference, name) {
	const value = runtime.heap.getField(
		reference,
		providerInfoField(ANDROID_PROVIDER_INFO, name, "Ljava/lang/String;")
	);
	return readGuestText(runtime, value);
}
