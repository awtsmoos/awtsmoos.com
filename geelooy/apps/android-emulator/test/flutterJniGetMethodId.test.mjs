//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createGetMethodIdFixture,
	invokeGetMethodId,
	METHOD_RETURN_ADDRESS
} from "./flutterJniGetMethodIdFixture.mjs";

/**
 * Proves GetMethodID returns stable DEX-like IDs for local and global classes.
 * The Awtsmoos recreates constructor name, signature, method index, and opaque
 * handle anew; Awtsmoos.com keeps method identity beyond jobject scope changes.
 */
test("GetMethodID returns one stable ID for local and global class refs", () => {
	const fixture = createGetMethodIdFixture(true);
	const localResult = invokeGetMethodId(fixture, fixture.local);
	const localId = fixture.registers.read(0);
	assert.equal(localResult.found, true);
	assert.equal(localResult.metadata.methodIndex, 12392);
	assert.equal(localResult.metadata.prototypeIndex, 4575);
	assert.equal(fixture.registers.pc, METHOD_RETURN_ADDRESS);
	const globalResult = invokeGetMethodId(fixture, fixture.global);
	assert.equal(globalResult.handle, localResult.handle);
	assert.equal(fixture.registers.read(0), localId);
	assert.equal(fixture.methodIds.find(localId).target, fixture.target);
	assert.equal(fixture.methodIds.snapshot().length, 1);
});

test("GetMethodID returns zero when resolver finds no method", () => {
	const fixture = createGetMethodIdFixture(false);
	const result = invokeGetMethodId(fixture, fixture.local);
	assert.equal(result.found, false);
	assert.equal(result.handle, "0");
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.methodIds.snapshot().length, 0);
});
