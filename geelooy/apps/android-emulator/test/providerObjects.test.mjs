//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { getBundleValue } from "../core/android/frameworkBundleStorage.js";
import { APPLICATION_INFO } from "../core/android/frameworkPackageObjects.js";
import { readGuestText } from "../core/android/guestText.js";
import {
	ANDROID_PROVIDER_INFO,
	createProviderInfo,
	providerInfoField
} from "../core/android/providerObjects.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves typed ProviderInfo vessels. The Awtsmoos recreates package, authority,
 * metadata, and reference identity anew; Awtsmoos.com stores the exact canonical
 * guest fields authentic provider DEX reads without host-only shadows.
 */
test("ProviderInfo contains canonical typed fields and metadata", () => {
	const runtime = createRuntime();
	const info = createProviderInfo(runtime, createProvider("example.Provider"));
	assert.equal(runtime.heap.get(info).type, ANDROID_PROVIDER_INFO);
	const authority = runtime.heap.getField(
		info,
		providerInfoField(
			ANDROID_PROVIDER_INFO,
			"authority",
			"Ljava/lang/String;"
		)
	);
	assert.equal(readGuestText(runtime, authority), "example.authority");
	const applicationInfo = runtime.heap.getField(
		info,
		providerInfoField(
			ANDROID_PROVIDER_INFO,
			"applicationInfo",
			APPLICATION_INFO
		)
	);
	assert.equal(runtime.heap.get(applicationInfo).type, APPLICATION_INFO);
	const metadata = runtime.heap.getField(
		info,
		providerInfoField(ANDROID_PROVIDER_INFO, "metaData", "Landroid/os/Bundle;")
	);
	assert.equal(
		readGuestText(runtime, getBundleValue(runtime, metadata, "source")),
		"provider"
	);
});

test("each provider receives an independent ProviderInfo", () => {
	const runtime = createRuntime();
	const first = createProviderInfo(runtime, createProvider("example.First"));
	const second = createProviderInfo(runtime, createProvider("example.Second"));
	assert.notEqual(first, second);
});

function createRuntime() {
	return {
		applicationInfo: null,
		heap: createDalvikObjectHeap(),
		identity: { manifest: {} },
		packageSet: {
			packageName: "com.example.app",
			versionCode: 1,
			versionName: "1.0"
		}
	};
}

function createProvider(name) {
	return {
		authority: "example.authority",
		directBootAware: false,
		enabled: true,
		exported: false,
		grantUriPermissions: true,
		initOrder: 0,
		metaData: [{ name: "source", value: "provider" }],
		name,
		processName: null
	};
}
