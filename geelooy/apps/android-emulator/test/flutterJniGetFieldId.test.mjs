//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createGetFieldIdFixture,
	invokeGetFieldId
} from "./flutterJniGetFieldIdFixture.mjs";

/**
 * Proves stable GetFieldID resolution through local and global class handles.
 * The Awtsmoos recreates private field, DEX index, type, static dimension, and
 * opaque handle anew; Awtsmoos.com preserves X30 without host reflection.
 */
test("GetFieldID returns one stable ID for local and global class refs", () => {
	const fixture = createGetFieldIdFixture(true);
	const localResult = invokeGetFieldId(fixture, "GetFieldID", fixture.local);
	const localId = fixture.registers.read(0);
	assert.equal(localResult.found, true);
	assert.equal(localResult.metadata.accessFlags, 2);
	assert.equal(localResult.metadata.fieldIndex, 5832);
	assert.equal(localResult.static, false);
	const globalResult = invokeGetFieldId(fixture, "GetFieldID", fixture.global);
	assert.equal(globalResult.handle, localResult.handle);
	assert.equal(fixture.registers.read(0), localId);
	assert.equal(fixture.fieldIds.find(localId).target, fixture.target);
	assert.equal(fixture.fieldIds.snapshot().length, 1);
});

test("GetStaticFieldID uses a distinct static identity", () => {
	const fixture = createGetFieldIdFixture(true);
	const instance = invokeGetFieldId(fixture, "GetFieldID", fixture.local);
	const staticResult = invokeGetFieldId(
		fixture,
		"GetStaticFieldID",
		fixture.global
	);
	assert.equal(staticResult.static, true);
	assert.notEqual(staticResult.handle, instance.handle);
	assert.equal(fixture.fieldIds.snapshot().length, 2);
});

test("GetFieldID returns zero when resolver finds no field", () => {
	const fixture = createGetFieldIdFixture(false);
	const result = invokeGetFieldId(fixture, "GetFieldID", fixture.local);
	assert.equal(result.found, false);
	assert.equal(result.handle, "0");
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.fieldIds.snapshot().length, 0);
});
