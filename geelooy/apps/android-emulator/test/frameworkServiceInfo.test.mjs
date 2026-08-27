//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { bundleValues } from "../core/android/frameworkBundleStorage.js";
import { installedServiceInfo } from "../core/android/frameworkServiceInfo.js";
import { readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const SERVICE = "com.google.firebase.components.ComponentDiscoveryService";
const PACKAGE_ITEM = "Landroid/content/pm/PackageItemInfo;";

/** Proves ServiceInfo carries exact manifest metadata as a guest Bundle. */
test("ServiceInfo exposes registrar metadata and stable guest identity", () => {
	const runtime = createRuntime();
	const first = installedServiceInfo(runtime, SERVICE);
	const second = installedServiceInfo(runtime, SERVICE);
	assert.deepEqual(second, first);
	const metadata = runtime.heap.getField(
		first,
		`${PACKAGE_ITEM}->metaData:Landroid/os/Bundle;`
	);
	const values = bundleValues(runtime, metadata);
	assert.equal(values.size, 2);
	assert.equal(
		readGuestText(runtime, values.get("registrar:installations")),
		"com.google.firebase.components.ComponentRegistrar"
	);
});

test("missing services remain an explicit package boundary", () => {
	const runtime = createRuntime();
	assert.throws(
		() => installedServiceInfo(runtime, "example.Missing"),
		error => error.code === "ANDROID_SERVICE_NOT_FOUND"
	);
});

function createRuntime() {
	const heap = createDalvikObjectHeap();
	return {
		heap,
		identity: {
			manifest: {
				components: { services: [serviceRecord()] },
				launcherActivity: "example.MainActivity"
			}
		},
		packageSet: {
			packageName: "example.app",
			versionCode: 1,
			versionName: "1.0"
		}
	};
}

function serviceRecord() {
	return {
		attributes: { directBootAware: true, enabled: true, exported: false },
		exported: false,
		metaData: [
			{ name: "registrar:installations", resource: null, value: "com.google.firebase.components.ComponentRegistrar" },
			{ name: "registrar:messaging", resource: null, value: "com.google.firebase.components.ComponentRegistrar" }
		],
		name: SERVICE
	};
}
