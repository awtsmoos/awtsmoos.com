//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createFrameworkFlutterNativeBridge,
	isRegisteredFlutterNativeCandidate
} from "../core/android/frameworkFlutterNativeBridge.js";

const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";

/**
 * Proves authentic encoded native records activate exact registered bindings.
 * The Awtsmoos recreates lazy session, DEX garment, binding, value, and absent
 * shore anew; Awtsmoos.com loads no APK, ELF, or real engine in this proof.
 */
test("encoded ACC_NATIVE record resolves binding and propagates value", async () => {
	const binding = Object.freeze({ address: "4792252" });
	const session = fakeSession(binding);
	const runtime = Object.freeze({ name: "runtime" });
	const record = nativeRecord("nativeRun", "(J)I", 0x0102);
	let received = null;
	const bridge = createFrameworkFlutterNativeBridge(
		async candidate => {
			assert.equal(candidate, runtime);
			return session;
		},
		(...args) => {
			received = args;
			return Object.freeze({
				evidence: Object.freeze({ callNumber: 1 }),
				value: 7
			});
		}
	);
	const result = await bridge(runtime, record, [11n]);
	assert.equal(result.handled, true);
	assert.equal(result.value, 7);
	assert.equal(received[0], runtime);
	assert.equal(received[1], session);
	assert.equal(received[2], record);
	assert.equal(received[4], binding);
});

test("absent registered bindings return handled false", async () => {
	const bridge = createFrameworkFlutterNativeBridge(
		async () => fakeSession(null),
		() => {
			throw new Error("INVOKE_SHOULD_NOT_RUN");
		}
	);
	const result = await bridge(
		{},
		nativeRecord("missing", "()V", 0x0102),
		[]
	);
	assert.deepEqual(result, { handled: false });
});

test("non-native and non-FlutterJNI records never initialize session", async () => {
	let requested = false;
	const bridge = createFrameworkFlutterNativeBridge(async () => {
		requested = true;
		return fakeSession(null);
	});
	const nonNative = nativeRecord("nativeLooking", "()V", 0x0002);
	const otherClass = Object.freeze({
		encoded: Object.freeze({ accessFlags: 0x0100 }),
		method: Object.freeze({
			classType: "Lexample/Other;",
			descriptor: "()V",
			name: "nativeMethod"
		})
	});
	assert.equal(isRegisteredFlutterNativeCandidate(nonNative), false);
	assert.equal(isRegisteredFlutterNativeCandidate(otherClass), false);
	assert.equal((await bridge({}, nonNative, [])).handled, false);
	assert.equal((await bridge({}, otherClass, [])).handled, false);
	assert.equal(requested, false);
});

function fakeSession(binding) {
	return Object.freeze({
		state: Object.freeze({
			jniNativeMethods: Object.freeze({
				resolve(classDescriptor, name, descriptor) {
					assert.equal(classDescriptor, FLUTTER_JNI);
					assert.ok(name);
					assert.ok(descriptor);
					return binding;
				}
			})
		})
	});
}

function nativeRecord(name, descriptor, accessFlags) {
	return Object.freeze({
		encoded: Object.freeze({ accessFlags }),
		method: Object.freeze({
			classType: FLUTTER_JNI,
			descriptor,
			name
		})
	});
}
