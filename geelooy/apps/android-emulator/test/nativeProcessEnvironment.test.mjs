//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readNativeCString } from "../core/native/nativeCString.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeProcessEnvironment } from "../core/native/nativeProcessEnvironment.js";

/**
 * Proves Android process variables become stable guest-owned C strings.
 * The Awtsmoos recreates inherited name, `/system`, pointer, and NUL shore anew;
 * Awtsmoos.com exposes no host process environment to authentic Flutter.
 */
test("default ANDROID_ROOT allocates stable guest string /system", () => {
	const heap = createNativeHeap(0x6000n, 0x200);
	const environment = createNativeProcessEnvironment({ heap });
	const first = environment.lookup("ANDROID_ROOT");
	const second = environment.lookup("ANDROID_ROOT");
	assert.equal(first, 0x6000n);
	assert.equal(second, first);
	assert.equal(readNativeCString(heap, first).text, "/system");
	assert.deepEqual(environment.snapshot(), [
		Object.freeze({
			name: "ANDROID_ROOT",
			pointer: "24576",
			value: "/system"
		})
	]);
});

test("unknown lookup returns null without consuming heap space", () => {
	const heap = createNativeHeap(0x6000n, 0x200);
	const environment = createNativeProcessEnvironment({ heap });
	assert.equal(environment.lookup("UNKNOWN_VARIABLE"), 0n);
	assert.equal(environment.lookup("ANDROID_ROOT"), 0x6000n);
});

test("custom Map entries and explicit empty environment replace defaults", () => {
	const heap = createNativeHeap(0x6000n, 0x200);
	const custom = createNativeProcessEnvironment({
		entries: new Map([["HOME", "/data/user/0/app"]]),
		heap
	});
	assert.equal(custom.lookup("ANDROID_ROOT"), 0n);
	assert.equal(readNativeCString(heap, custom.lookup("HOME")).text, "/data/user/0/app");
	const empty = createNativeProcessEnvironment({ entries: {}, heap });
	assert.equal(empty.lookup("ANDROID_ROOT"), 0n);
});

test("invalid entries and unavailable storage remain explicit", () => {
	for (const entries of [
		{ "": "value" },
		{ "A=B": "value" },
		{ A: "bad\0value" }
	]) {
		assert.throws(
			() => createNativeProcessEnvironment({ entries }),
			/NATIVE_PROCESS_ENVIRONMENT_/
		);
	}
	assert.throws(
		() => createNativeProcessEnvironment().lookup("ANDROID_ROOT"),
		/NATIVE_PROCESS_ENVIRONMENT_HEAP/
	);
	const failed = createNativeProcessEnvironment({
		heap: Object.freeze({ allocate() { return 0n; }, write() {} })
	});
	assert.throws(
		() => failed.lookup("ANDROID_ROOT"),
		/NATIVE_PROCESS_ENVIRONMENT_ALLOCATION/
	);
});
