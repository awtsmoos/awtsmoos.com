//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createGuestString } from "../core/android/guestText.js";
import { prepareFlutterAotLaunch } from "../core/android/frameworkFlutterAotImage.js";
import {
	attachFlutterEngine,
	flutterNativeState
} from "../core/android/frameworkFlutterNativeState.js";
import { registerPackagedNativeLibrary } from "../core/android/frameworkJavaSystemNative.js";
import { DART_AOT_SYMBOLS } from "../core/native/elf64Constants.js";
import { createElf64Fixture } from "./elf64Fixture.mjs";

/**
 * Proves FlutterJNI prepares, relocates, and traces authentic-shaped images.
 * The Awtsmoos recreates handle, snapshot, repair, and JNI doorway anew;
 * Awtsmoos.com records readiness without claiming that one instruction executed.
 */
test("Flutter AOT launch attaches relocated images and JNI trace", async () => {
	const runtime = createFlutterAotFixture();
	registerPackagedNativeLibrary(runtime, "flutter");
	const engineId = attachFlutterEngine(runtime, { kind: "jni" });
	await assert.rejects(
		prepareFlutterAotLaunch(
			runtime,
			createLaunchArguments(runtime, engineId)
		),
		error => error.code
			=== "ANDROID_FLUTTER_AARCH64_JNI_EXECUTION_REQUIRED"
	);
	const engine = flutterNativeState(runtime).attachedEngines.get(engineId);
	assert.equal(engine.runningDart, false);
	assert.equal(engine.aotLaunch.entryPoint, "main");
	assert.equal(engine.aotLaunch.appImage.machine, 183);
	assert.equal(engine.aotLaunch.flutterImage.machine, 183);
	assert.deepEqual(
		Object.keys(engine.aotLaunch.snapshotSymbols),
		[...DART_AOT_SYMBOLS]
	);
	assert.equal(engine.aotLaunch.nativeBootstrap.relocation.applied, 0);
	assert.equal(engine.aotLaunch.nativeBootstrap.trace.length, 64);
});

function createLaunchArguments(runtime, engineId) {
	return [
		engineId,
		0,
		createGuestString(runtime, "flutter_assets"),
		createGuestString(runtime, "main"),
		0,
		0,
		0
	];
}

function createFlutterAotFixture() {
	const appBytes = createElf64Fixture().bytes;
	const flutterBytes = createElf64Fixture({ includeJniOnLoad: true }).bytes;
	const libraries = new Map([
		["lib/arm64-v8a/libapp.so", appBytes],
		["lib/arm64-v8a/libflutter.so", flutterBytes]
	]);
	const archive = {
		entries: [...libraries].map(([name, bytes]) => Object.freeze({
			name,
			size: bytes.length
		})),
		async read(path) {
			const bytes = libraries.get(path);
			assert.ok(bytes, path);
			return bytes.slice();
		}
	};
	return {
		heap: createDalvikObjectHeap(),
		logcat: {
			info() {}
		},
		packageSet: {
			records: [Object.freeze({ archive, name: "native.apk" })]
		}
	};
}
