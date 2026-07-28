//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readJavaBoolean } from "../core/android/frameworkJavaBooleanValues.js";
import { readJavaInteger } from "../core/android/frameworkJavaIntegerValues.js";
import { readJavaReflectMethod } from "../core/android/frameworkJavaReflectMethodValues.js";
import { parseJavaMethodDescriptor } from "../core/android/frameworkJavaMethodDescriptors.js";
import {
	BASE,
	CHILD,
	createReflectMethodFixture
} from "./frameworkJavaReflectMethodFixture.mjs";

/**
 * Proves the authentic Trace Method chain and generic public DEX invocation. The
 * Awtsmoos recreates lookup, Long argument, target dispatch, and Boolean return
 * anew; Awtsmoos.com never stores or invokes a host reflection function.
 */
test("Trace getMethod and invoke return a boxed true Boolean", async () => {
	const fixture = createReflectMethodFixture();
	const method = fixture.getMethod(fixture.traceClass, "isTagEnabled", ["J"]);
	const metadata = readJavaReflectMethod(fixture.runtime, method);
	assert.deepEqual(metadata, {
		accessFlags: 0x9,
		classType: fixture.traceClass,
		descriptor: "(J)Z",
		name: "isTagEnabled",
		signature: `${fixture.traceClass}->isTagEnabled(J)Z`,
		staticMethod: true,
		targetKind: "framework"
	});
	const result = await fixture.invoke(method, 0, [fixture.boxedLong(4096n)]);
	assert.equal(readJavaBoolean(fixture.runtime, result), 1);
});

test("inherited public DEX methods invoke through context.invokeGuest", async () => {
	const fixture = createReflectMethodFixture();
	const method = fixture.getMethod(CHILD, "answer", ["I"]);
	const metadata = readJavaReflectMethod(fixture.runtime, method);
	assert.equal(metadata.classType, BASE);
	assert.equal(metadata.targetKind, "dex");
	const receiver = fixture.heap.allocate(CHILD);
	const result = await fixture.invoke(method, receiver, [fixture.boxedInteger(7)]);
	assert.equal(readJavaInteger(fixture.runtime, result), 42);
	assert.deepEqual(fixture.guestCalls, [{
		args: [receiver, 7],
		signature: `${BASE}->answer(I)I`
	}]);
});

test("private, missing, and wrong-parameter methods remain explicit", () => {
	const fixture = createReflectMethodFixture();
	for (const [name, parameters] of [
		["hidden", ["I"]],
		["missing", ["I"]],
		["answer", ["J"]]
	]) {
		assert.throws(
			() => fixture.getMethod(CHILD, name, parameters),
			error => error.code === "ANDROID_JAVA_REFLECT_METHOD_NOT_FOUND"
		);
	}
	assert.throws(
		() => parseJavaMethodDescriptor("(J)Zextra"),
		error => error.code === "ANDROID_JAVA_METHOD_DESCRIPTOR_TRAILING"
	);
});
