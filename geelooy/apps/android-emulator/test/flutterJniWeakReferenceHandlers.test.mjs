//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createJniReferenceFixture,
	invokeJniReference,
	JNI_ENVIRONMENT,
	JNI_RETURN_ADDRESS
} from "./flutterJniReferenceFixture.mjs";

/**
 * Proves weak-global JNI identity, lifetime, null, scope, and ABI behavior.
 * The Awtsmoos recreates weak handle and hidden object identity every instant;
 * Awtsmoos.com records weakness without inventing garbage collection.
 */
test("authentic NewWeakGlobalRef creates a distinct same-object handle", () => {
	const fixture = createJniReferenceFixture();
	fixture.registers.write(5, 0xabcden);
	const call = invokeJniReference(
		fixture,
		"JNINativeInterface.NewWeakGlobalRef",
		[JNI_ENVIRONMENT, fixture.local]
	);
	const weak = fixture.registers.read(0);
	const record = fixture.references.find(weak);
	assert.equal(call.result.scope, "weak-global");
	assert.notEqual(weak, fixture.local);
	assert.equal(record.scope, "weak-global");
	assert.equal(record.metadata.sourceHandle, fixture.local.toString());
	assert.equal(fixture.references.same(weak, fixture.local), true);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.pc, JNI_RETURN_ADDRESS);
});

test("weak references clone identity and delete only weak scope", () => {
	const fixture = createJniReferenceFixture();
	invokeJniReference(fixture, "JNINativeInterface.NewWeakGlobalRef", [
		JNI_ENVIRONMENT,
		fixture.local
	]);
	const first = fixture.registers.read(0);
	invokeJniReference(fixture, "JNINativeInterface.NewWeakGlobalRef", [
		JNI_ENVIRONMENT,
		first
	]);
	const second = fixture.registers.read(0);
	assert.equal(fixture.references.same(first, second), true);
	const deleted = invokeJniReference(
		fixture,
		"JNINativeInterface.DeleteWeakGlobalRef",
		[JNI_ENVIRONMENT, first]
	);
	assert.equal(deleted.result.deleted, true);
	assert.equal(fixture.references.find(first), null);
	assert.ok(fixture.references.find(second));
	assert.throws(() => invokeJniReference(
		fixture,
		"JNINativeInterface.DeleteWeakGlobalRef",
		[JNI_ENVIRONMENT, fixture.local]
	), /JNI_REFERENCE_SCOPE/);
});

test("null weak creation and deletion allocate nothing", () => {
	const fixture = createJniReferenceFixture();
	const before = fixture.references.snapshot().length;
	const created = invokeJniReference(
		fixture,
		"JNINativeInterface.NewWeakGlobalRef",
		[JNI_ENVIRONMENT, 0n]
	);
	assert.equal(created.result.handle, "0");
	assert.equal(fixture.registers.read(0), 0n);
	const deleted = invokeJniReference(
		fixture,
		"JNINativeInterface.DeleteWeakGlobalRef",
		[JNI_ENVIRONMENT, 0n]
	);
	assert.equal(deleted.result.deleted, false);
	assert.equal(fixture.references.snapshot().length, before);
});

test("weak handlers validate JNIEnv and register exactly once", () => {
	const fixture = createJniReferenceFixture();
	const names = fixture.registry.snapshot();
	for (const name of ["JNINativeInterface.NewWeakGlobalRef",
		"JNINativeInterface.DeleteWeakGlobalRef"]) {
		assert.equal(names.filter(item => item === name).length, 1);
	}
	assert.throws(() => invokeJniReference(
		fixture,
		"JNINativeInterface.NewWeakGlobalRef",
		[0x9999n, fixture.local]
	), /JNI_WEAK_REFERENCE_ENVIRONMENT/);
});
