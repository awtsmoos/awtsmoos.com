//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createGetFieldIdFixture,
	FIELD_ENVIRONMENT,
	FIELD_RETURN
} from "./flutterJniGetFieldIdFixture.mjs";

/**
 * Proves field-ID lookup rejects foreign environments and non-class references.
 * The Awtsmoos recreates invalid vessel, explicit refusal, and untouched field
 * registry anew; Awtsmoos.com never turns arbitrary JNI numbers into fields.
 */
test("GetFieldID rejects an invalid JNIEnv", () => {
	const fixture = createGetFieldIdFixture(true);
	prepare(fixture, fixture.local);
	fixture.registers.write(0, 0xdeadn);
	assert.throws(
		() => handle(fixture, "GetFieldID"),
		/JNI_FIELD_ID_ENVIRONMENT/
	);
	assert.equal(fixture.fieldIds.snapshot().length, 0);
});

test("GetFieldID rejects a non-class handle", () => {
	const fixture = createGetFieldIdFixture(true);
	const objectHandle = fixture.references.create(
		"object",
		"not-a-class",
		{},
		{ scope: "local" }
	);
	prepare(fixture, objectHandle);
	assert.throws(
		() => handle(fixture, "GetFieldID"),
		/JNI_FIELD_ID_CLASS/
	);
	assert.equal(fixture.fieldIds.snapshot().length, 0);
});

function prepare(fixture, classHandle) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, FIELD_ENVIRONMENT);
	fixture.registers.write(1, classHandle);
	fixture.registers.write(2, 0x6000n);
	fixture.registers.write(3, 0x6100n);
	fixture.registers.write(30, FIELD_RETURN);
}

function handle(fixture, name) {
	return fixture.registry.handle(
		Object.freeze({ name: `JNINativeInterface.${name}` }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}
