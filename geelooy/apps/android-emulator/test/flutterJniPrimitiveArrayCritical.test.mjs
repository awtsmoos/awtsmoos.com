//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createPrimitiveArrayFixture,
	invokePrimitiveArray,
	JNI_ENVIRONMENT
} from "./flutterJniPrimitiveArrayFixture.mjs";

function newByteArray(fixture, length) {
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.NewByteArray",
		[JNI_ENVIRONMENT, BigInt(length)]
	);
	return fixture.registers.read(0, 64, "zero");
}

test("PrimitiveArrayCritical aliases a guest copy and commits signed bytes", () => {
	const fixture = createPrimitiveArrayFixture();
	const handle = newByteArray(fixture, 2);
	const seed = fixture.nativeHeap.allocate(2n);
	fixture.memory.write(seed, Uint8Array.of(0xff, 0x02));
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.SetByteArrayRegion",
		[JNI_ENVIRONMENT, handle, 0n, 2n, seed]
	);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.GetPrimitiveArrayCritical",
		[JNI_ENVIRONMENT, handle, 0n]
	);
	const pointer = fixture.registers.read(0, 64, "zero");
	assert.deepEqual([...fixture.memory.read(pointer, 2)], [0xff, 0x02]);
	fixture.memory.write(pointer, Uint8Array.of(0x80, 0x7f));
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.ReleasePrimitiveArrayCritical",
		[JNI_ENVIRONMENT, handle, pointer, 0n]
	);
	const target = fixture.references.find(handle).target;
	assert.deepEqual(
		[fixture.heap.arrayGet(target, 0), fixture.heap.arrayGet(target, 1)],
		[-128, 127]
	);
	assert.equal(fixture.nativeHeap.allocation(pointer), null);
});

test("zero-length primitive arrays return a harmless null elements pointer", () => {
	const fixture = createPrimitiveArrayFixture();
	const handle = newByteArray(fixture, 0);
	const isCopy = fixture.nativeHeap.allocate(1n);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.GetByteArrayElements",
		[JNI_ENVIRONMENT, handle, isCopy]
	);
	assert.equal(fixture.registers.read(0, 64, "zero"), 0n);
	assert.equal(fixture.memory.read(isCopy, 1)[0], 1);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.ReleaseByteArrayElements",
		[JNI_ENVIRONMENT, handle, 0n, 0n]
	);
});

test("primitive regions reject out-of-bounds ranges before touching memory", () => {
	const fixture = createPrimitiveArrayFixture();
	const handle = newByteArray(fixture, 2);
	const destination = fixture.nativeHeap.allocate(2n);
	assert.throws(
		() => invokePrimitiveArray(
			fixture,
			"JNINativeInterface.GetByteArrayRegion",
			[JNI_ENVIRONMENT, handle, 1n, 2n, destination]
		),
		error => {
			assert.equal(error.code, "JNI_PRIMITIVE_ARRAY_RANGE");
			return true;
		}
	);
});
