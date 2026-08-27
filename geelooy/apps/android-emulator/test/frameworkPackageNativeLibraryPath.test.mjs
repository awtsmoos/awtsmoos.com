//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { installedNativeLibraryDirectory } from "../core/android/frameworkPackageNativeLibraryPath.js";
import { installedApplicationInfo } from "../core/android/frameworkPackageObjects.js";
import { readJavaText } from "../core/android/frameworkJavaStringValue.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

test("native library directory follows measured ABI priority", () => {
	const runtime = fixture([
		"lib/x86/libapp.so",
		"lib/arm64-v8a/libflutter.so",
		"lib/armeabi-v7a/libapp.so"
	]);
	assert.equal(
		installedNativeLibraryDirectory(runtime),
		"/data/app/com.example.app/lib/arm64-v8a"
	);
});

test("ApplicationInfo exposes a guest nativeLibraryDir String", () => {
	const runtime = fixture(["lib/arm64-v8a/libapp.so"]);
	const application = installedApplicationInfo(runtime);
	const signature = "Landroid/content/pm/ApplicationInfo;->nativeLibraryDir:Ljava/lang/String;";
	const reference = runtime.heap.getField(application, signature);
	assert.equal(
		readJavaText(runtime, reference),
		"/data/app/com.example.app/lib/arm64-v8a"
	);
	assert.equal(installedApplicationInfo(runtime), application);
});

test("packages without native libraries retain a deterministic lib root", () => {
	assert.equal(
		installedNativeLibraryDirectory(fixture([])),
		"/data/app/com.example.app/lib"
	);
});

function fixture(entries) {
	return {
		heap: createDalvikObjectHeap(),
		packageSet: {
			packageName: "com.example.app",
			records: [{
				archive: {
					entries: entries.map(name => ({ name }))
				}
			}]
		}
	};
}
