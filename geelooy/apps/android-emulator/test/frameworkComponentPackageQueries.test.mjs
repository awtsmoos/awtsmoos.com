//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	invokeComponentPackageQuery,
	isComponentPackageQuery
} from "../core/android/frameworkComponentPackageQueries.js";
import { createComponentName } from "../core/android/frameworkComponentObjects.js";
import { SERVICE_INFO } from "../core/android/frameworkServiceInfo.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const PACKAGE_MANAGER = "Landroid/content/pm/PackageManager;";
const COMPONENT = "Landroid/content/ComponentName;";
const SIGNATURE = `${PACKAGE_MANAGER}->getServiceInfo(${COMPONENT}I)${SERVICE_INFO}`;

/** Proves PackageManager resolves only installed manifest services. */
test("getServiceInfo resolves a matching ComponentName", () => {
	const runtime = createRuntime();
	const component = createComponentName(runtime, "example.app", "example.Service");
	assert.equal(isComponentPackageQuery(SIGNATURE), true);
	const result = invokeComponentPackageQuery(runtime, SIGNATURE, [
		runtime.packageManager,
		component,
		128
	]);
	assert.equal(runtime.heap.get(result).type, SERVICE_INFO);
});

test("foreign packages are rejected before service lookup", () => {
	const runtime = createRuntime();
	const component = createComponentName(runtime, "foreign.app", "example.Service");
	assert.throws(
		() => invokeComponentPackageQuery(runtime, SIGNATURE, [0, component, 0]),
		error => error.code === "ANDROID_COMPONENT_NOT_FOUND"
	);
});

function createRuntime() {
	const heap = createDalvikObjectHeap();
	return {
		heap,
		identity: {
			manifest: {
				components: { services: [{
					attributes: { enabled: true },
					exported: false,
					metaData: [],
					name: "example.Service"
				}] },
				launcherActivity: "example.MainActivity"
			}
		},
		packageManager: heap.allocate(PACKAGE_MANAGER),
		packageSet: { packageName: "example.app", versionCode: 1, versionName: "1" }
	};
}
