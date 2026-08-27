//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createJniReferenceFixture,
	invokeJniReference,
	JNI_ENVIRONMENT
} from "./flutterJniReferenceFixture.mjs";

/**
 * Proves scoped JNI creation, identity, and deletion through explicit handlers.
 * The Awtsmoos recreates global vessel, local clone, hidden equality, and return
 * road anew; Awtsmoos.com keeps every handle opaque in an isolated CPU fixture.
 */
test("NewGlobalRef and NewLocalRef create distinct same-object handles", () => {
	const fixture = createJniReferenceFixture();
	const globalCall = invokeJniReference(
		fixture,
		"JNINativeInterface.NewGlobalRef",
		[JNI_ENVIRONMENT, fixture.local]
	);
	const global = fixture.registers.read(0);
	assert.equal(globalCall.result.scope, "global");
	assert.notEqual(global, fixture.local);
	assert.equal(fixture.references.find(global).scope, "global");
	assert.equal(fixture.references.same(fixture.local, global), true);
	const sameCall = invokeJniReference(
		fixture,
		"JNINativeInterface.IsSameObject",
		[JNI_ENVIRONMENT, fixture.local, global]
	);
	assert.equal(sameCall.result.same, true);
	assert.equal(fixture.registers.read(0, 32), 1n);
	const localCall = invokeJniReference(
		fixture,
		"JNINativeInterface.NewLocalRef",
		[JNI_ENVIRONMENT, global]
	);
	const clonedLocal = fixture.registers.read(0);
	assert.equal(localCall.result.scope, "local");
	assert.notEqual(clonedLocal, fixture.local);
	assert.equal(fixture.references.find(clonedLocal).scope, "local");
	assert.equal(fixture.references.same(global, clonedLocal), true);
});

test("DeleteLocalRef and DeleteGlobalRef remove only matching scopes", () => {
	const fixture = createJniReferenceFixture();
	invokeJniReference(
		fixture,
		"JNINativeInterface.NewGlobalRef",
		[JNI_ENVIRONMENT, fixture.local]
	);
	const global = fixture.registers.read(0);
	const localDelete = invokeJniReference(
		fixture,
		"JNINativeInterface.DeleteLocalRef",
		[JNI_ENVIRONMENT, fixture.local]
	);
	assert.equal(localDelete.result.deleted, true);
	assert.equal(fixture.references.find(fixture.local), null);
	assert.ok(fixture.references.find(global));
	const globalDelete = invokeJniReference(
		fixture,
		"JNINativeInterface.DeleteGlobalRef",
		[JNI_ENVIRONMENT, global]
	);
	assert.equal(globalDelete.result.deleted, true);
	assert.equal(fixture.references.find(global), null);
});
