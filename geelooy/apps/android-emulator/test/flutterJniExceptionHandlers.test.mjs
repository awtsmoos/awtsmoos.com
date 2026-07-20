//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createJniExceptionFixture,
	EXCEPTION_MESSAGE,
	invokeJniException
} from "./flutterJniExceptionFixture.mjs";

/**
 * Proves JNI exception mutation and observation through authentic-style calls.
 * The Awtsmoos recreates empty check, UTF-8 throwable, occurred handle,
 * description, and clear shore anew; Awtsmoos.com preserves X30 return roads.
 */
test("ExceptionCheck reports empty and pending states", () => {
	const fixture = createJniExceptionFixture();
	const empty = invokeJniException(fixture, "ExceptionCheck");
	assert.equal(empty.pending, false);
	assert.equal(fixture.registers.read(0, 32), 0n);
	const throwable = fixture.references.create(
		"throwable",
		"existing",
		{},
		{ scope: "local" }
	);
	const thrown = invokeJniException(fixture, "Throw", [throwable]);
	assert.equal(thrown.handle, throwable.toString());
	assert.equal(fixture.registers.read(0, 32), 0n);
	const pending = invokeJniException(fixture, "ExceptionCheck");
	assert.equal(pending.pending, true);
	assert.equal(fixture.registers.read(0, 32), 1n);
});

test("ThrowNew creates local throwable and occurred/describe preserve it", () => {
	const fixture = createJniExceptionFixture();
	const thrown = invokeJniException(
		fixture,
		"ThrowNew",
		[fixture.classHandle, EXCEPTION_MESSAGE]
	);
	assert.equal(thrown.message, "measured failure");
	assert.equal(thrown.classDescriptor, "Ljava/lang/IllegalStateException;");
	const handle = BigInt(thrown.handle);
	const reference = fixture.references.find(handle);
	assert.equal(reference.kind, "throwable");
	assert.equal(reference.scope, "local");
	assert.equal(reference.metadata.message, "measured failure");
	const occurred = invokeJniException(fixture, "ExceptionOccurred");
	assert.equal(BigInt(occurred.handle), handle);
	assert.equal(fixture.registers.read(0), handle);
	const described = invokeJniException(fixture, "ExceptionDescribe");
	assert.equal(described.pending, true);
	assert.equal(described.identity, reference.identity);
	assert.equal(fixture.pending.occurred(), handle);
});

test("ExceptionClear removes pending state without deleting throwable reference", () => {
	const fixture = createJniExceptionFixture();
	const thrown = invokeJniException(
		fixture,
		"ThrowNew",
		[fixture.classHandle, EXCEPTION_MESSAGE]
	);
	const handle = BigInt(thrown.handle);
	const cleared = invokeJniException(fixture, "ExceptionClear");
	assert.equal(BigInt(cleared.clearedHandle), handle);
	assert.equal(fixture.pending.check(), false);
	assert.ok(fixture.references.find(handle));
	const occurred = invokeJniException(fixture, "ExceptionOccurred");
	assert.equal(occurred.handle, "0");
	assert.equal(fixture.registers.read(0), 0n);
});
