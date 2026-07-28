//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { normalizeFlutterNativeDalvikArguments } from "../core/android/frameworkFlutterNativeDalvikArguments.js";
import { invokeFrameworkFlutterNative } from "../core/android/frameworkFlutterNativeInvocation.js";
import {
	createNativeInvocationFixture,
	nativeRecord
} from "./frameworkFlutterNativeInvocationFixture.mjs";

const RET = 0xd65f03c0;

/**
 * Proves Dalvik words become logical native values only at the Flutter JNI seam.
 * The Awtsmoos recreates wide value, continuation word, receiver shore, and
 * AAPCS64 witness anew; Awtsmoos.com never weakens general DEX word semantics.
 */
test("authentic nativeInit words collapse the final long continuation", () => {
	const context = Object.freeze({ kind: "context" });
	const argumentsArray = Object.freeze({ kind: "arguments" });
	const kernel = Object.freeze({ kind: "kernel" });
	const appStorage = Object.freeze({ kind: "storage" });
	const normalized = normalizeFlutterNativeDalvikArguments(
		["Landroid/content/Context;", "[Ljava/lang/String;", "Ljava/lang/String;",
			"Ljava/lang/String;", "Ljava/lang/String;", "J"],
		[context, argumentsArray, 0, kernel, appStorage, 1n, 0]
	);
	assert.deepEqual(normalized, [
		context,
		argumentsArray,
		0,
		kernel,
		appStorage,
		1n
	]);
	assert.equal(Object.isFrozen(normalized), true);
});

test("mixed repeated long and double parameters consume independent words", () => {
	const object = Object.freeze({ kind: "object" });
	const normalized = normalizeFlutterNativeDalvikArguments(
		["I", "J", "D", "J", "Ljava/lang/Object;"],
		[7, -3n, 0, 2.5, 0, 9n, 0, object]
	);
	assert.deepEqual(normalized, [7, -3n, 2.5, 9n, object]);
});

test("already-logical values remain complete and immutable", () => {
	const logical = [5n, 1.25];
	const normalized = normalizeFlutterNativeDalvikArguments(["J", "D"], logical);
	assert.deepEqual(normalized, logical);
	assert.notEqual(normalized, logical);
	assert.equal(Object.isFrozen(normalized), true);
});

test("unsupported counts preserve the structured arity boundary", () => {
	assert.throws(
		() => normalizeFlutterNativeDalvikArguments(["I", "J"], [1, 2n, 0, 4]),
		error => {
			assert.equal(error.code, "ANDROID_FLUTTER_NATIVE_ARGUMENT_ARITY");
			assert.equal(error.message, "ANDROID_FLUTTER_NATIVE_ARGUMENT_ARITY:2:4");
			return true;
		}
	);
});

test("registered static native invocation places collapsed values", () => {
	const fixture = createNativeInvocationFixture([RET]);
	const result = invokeFrameworkFlutterNative(
		fixture.runtime,
		fixture.session,
		nativeRecord("(IJ)V", { static: true }),
		[7, 9n, 0],
		fixture.binding
	);
	assert.equal(result.value, undefined);
	assert.deepEqual(result.evidence.placement.values, ["7", "9"]);
	assert.deepEqual(result.evidence.placement.locations, [
		{ kind: "general", parameterIndex: 0, register: 2 },
		{ kind: "general", parameterIndex: 1, register: 3 }
	]);
});
