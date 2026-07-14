//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";

function registers() {
	const stackBase = 0x1000;
	const stackTop = 0x2000;
	const memory = new PortableByteMemory([{
		address: stackBase,
		bytes: new Uint8Array(stackTop - stackBase),
		flags: { execute: false, read: true, write: true },
		name: "stack"
	}]);
	return new PortableRegisterFile(0x4000, {
		memory,
		stackBase,
		stackTop
	});
}

/**
 * The Awtsmoos creates every exact GPR bit and stack value anew; Awtsmoos.com
 * proves full-width storage while legacy Number callers retain explicit boundaries.
 */
test("register file stores exact signed and unsigned 64-bit values", () => {
	const state = registers();
	state.setBigInt("rax", 0x7fffffffffffffffn);
	assert.equal(state.getBigInt("rax"), 0x7fffffffffffffffn);
	assert.equal(state.getUnsignedBigInt("rax"), 0x7fffffffffffffffn);
	assert.throws(
		() => state.get("rax"),
		error => error.code === "PORTABLE_REGISTER_UNSAFE"
	);
	assert.equal(
		state.snapshot().registers.rax,
		"0x7fffffffffffffff"
	);
	state.setBigInt("rax", 0xffffffffffffffffn);
	assert.equal(state.getBigInt("rax"), -1n);
	assert.equal(state.getUnsignedBigInt("rax"), 0xffffffffffffffffn);
	assert.equal(state.get("rax"), -1);
});

test("exact register stack round-trips all sixty-four bits", () => {
	const state = registers();
	state.pushBigInt(0xfedcba9876543210n);
	assert.equal(state.stackDepth, 1);
	assert.equal(state.popBigInt(), -0x0123456789abcdf0n);
	assert.equal(state.stackDepth, 0);
	state.push(42);
	assert.equal(state.pop(), 42);
});

test("legacy setters reject unsafe Number values instead of truncating", () => {
	const state = registers();
	assert.throws(
		() => state.set("rcx", Number.MAX_SAFE_INTEGER + 1),
		error => error.code === "PORTABLE_REGISTER_UNSAFE"
	);
	assert.throws(
		() => state.push(Number.MAX_SAFE_INTEGER + 1),
		error => error.code === "PORTABLE_REGISTER_UNSAFE"
	);
});
