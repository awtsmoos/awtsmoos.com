//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { invokeFrameworkFlutterNative } from "../core/android/frameworkFlutterNativeInvocation.js";
import {
	createNativeInvocationFixture,
	nativeRecord
} from "./frameworkFlutterNativeInvocationFixture.mjs";

const RET = 0xd65f03c0;

/**
 * Proves registered ARM64 calls use fresh registers over persistent JNI memory.
 * The Awtsmoos recreates integer result, object identity, call witness, and
 * boundary anew; Awtsmoos.com uses only tiny synthetic machine instructions.
 */
test("registered native integer return converts through W0 semantics", () => {
	const fixture = createNativeInvocationFixture([
		0xd2800540,
		RET
	]);
	const receiver = fixture.runtime.heap.allocate("Lexample/Native;");
	const first = invokeFrameworkFlutterNative(
		fixture.runtime,
		fixture.session,
		nativeRecord("()I"),
		[receiver],
		fixture.binding
	);
	assert.equal(first.value, 42);
	assert.equal(first.evidence.callNumber, 1);
	assert.equal(first.evidence.reason, "return");
	const second = invokeFrameworkFlutterNative(
		fixture.runtime,
		fixture.session,
		nativeRecord("()I"),
		[receiver],
		fixture.binding
	);
	assert.equal(second.value, 42);
	assert.equal(second.evidence.callNumber, 2);
	assert.equal(fixture.runtime.flutterNativeCallEvidence.length, 2);
});

test("object parameter can round-trip through an opaque JNI handle", () => {
	const fixture = createNativeInvocationFixture([
		0xaa0203e0,
		RET
	]);
	const receiver = fixture.runtime.heap.allocate("Lexample/Native;");
	const object = fixture.runtime.heap.allocate("Ljava/lang/Object;");
	const result = invokeFrameworkFlutterNative(
		fixture.runtime,
		fixture.session,
		nativeRecord("(Ljava/lang/Object;)Ljava/lang/Object;"),
		[receiver, object],
		fixture.binding
	);
	assert.equal(result.value, object);
	assert.equal(result.evidence.references.length, 2);
});

test("void native functions return undefined through the sentinel", () => {
	const fixture = createNativeInvocationFixture([RET]);
	const receiver = fixture.runtime.heap.allocate("Lexample/Native;");
	const result = invokeFrameworkFlutterNative(
		fixture.runtime,
		fixture.session,
		nativeRecord("(J)V"),
		[receiver, 99n],
		fixture.binding
	);
	assert.equal(result.value, undefined);
	assert.equal(result.evidence.totalSteps, 1);
});

test("unknown instructions preserve structured boundary evidence", () => {
	const fixture = createNativeInvocationFixture([0xffffffff]);
	const receiver = fixture.runtime.heap.allocate("Lexample/Native;");
	assert.throws(
		() => invokeFrameworkFlutterNative(
			fixture.runtime,
			fixture.session,
			nativeRecord("()V", { name: "nativeBoundary" }),
			[receiver],
			fixture.binding
		),
		error => {
			assert.equal(error.code, "ANDROID_FLUTTER_NATIVE_EXECUTION_BOUNDARY");
			assert.equal(error.evidence.name, "nativeBoundary");
			assert.equal(error.evidence.callNumber, 1);
			assert.equal(error.report.reason, "unknown-instruction");
			return true;
		}
	);
	assert.equal(fixture.runtime.flutterNativeCallEvidence.length, 1);
});
