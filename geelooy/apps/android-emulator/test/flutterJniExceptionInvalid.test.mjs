//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createJniExceptionFixture,
	EXCEPTION_MESSAGE,
	EXCEPTION_RETURN
} from "./flutterJniExceptionFixture.mjs";

/**
 * Proves JNI exception handlers reject foreign environments and invalid handles.
 * The Awtsmoos recreates boundary, invalid class, absent throwable, and refusal
 * anew; Awtsmoos.com never turns arbitrary native numbers into pending objects.
 */
test("ExceptionCheck rejects an invalid JNIEnv", () => {
	const fixture = createJniExceptionFixture();
	fixture.registers.write(0, 0xdeadn);
	fixture.registers.write(30, EXCEPTION_RETURN);
	assert.throws(
		() => fixture.registry.handle(
			Object.freeze({ name: "JNINativeInterface.ExceptionCheck" }),
			Object.freeze({ memory: fixture.memory, registers: fixture.registers })
		),
		/JNI_EXCEPTION_ENVIRONMENT/
	);
});

test("Throw rejects an unknown reference handle", () => {
	const fixture = createJniExceptionFixture();
	prepare(fixture);
	fixture.registers.write(1, 0xdeadn);
	assert.throws(
		() => handle(fixture, "Throw"),
		/JNI_THROW_HANDLE/
	);
	assert.equal(fixture.pending.check(), false);
});

test("ThrowNew rejects a non-class reference", () => {
	const fixture = createJniExceptionFixture();
	const objectHandle = fixture.references.create(
		"object",
		"not-a-class",
		{},
		{ scope: "local" }
	);
	prepare(fixture);
	fixture.registers.write(1, objectHandle);
	fixture.registers.write(2, EXCEPTION_MESSAGE);
	assert.throws(
		() => handle(fixture, "ThrowNew"),
		/JNI_THROW_NEW_CLASS/
	);
	assert.equal(fixture.pending.check(), false);
});

function prepare(fixture) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, 0x5000n);
	fixture.registers.write(30, EXCEPTION_RETURN);
}

function handle(fixture, name) {
	return fixture.registry.handle(
		Object.freeze({ name: `JNINativeInterface.${name}` }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}
