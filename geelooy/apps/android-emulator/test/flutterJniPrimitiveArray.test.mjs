//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createPrimitiveArrayFixture,
	invokePrimitiveArray,
	JNI_ENVIRONMENT,
	readInt32Values,
	writeInt32Values
} from "./flutterJniPrimitiveArrayFixture.mjs";

function newIntArray(fixture, length = 3) {
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.NewIntArray",
		[JNI_ENVIRONMENT, BigInt(length)]
	);
	return fixture.registers.read(0, 64, "zero");
}

test("typed JNI regions copy between Java arrays and guest-native memory", () => {
	const fixture = createPrimitiveArrayFixture();
	const handle = newIntArray(fixture);
	const source = fixture.nativeHeap.allocate(12n);
	writeInt32Values(fixture.memory, source, [-7, 22, 0x1234567]);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.SetIntArrayRegion",
		[JNI_ENVIRONMENT, handle, 0n, 3n, source]
	);
	const target = fixture.references.find(handle).target;
	assert.deepEqual(
		[0, 1, 2].map(index => fixture.heap.arrayGet(target, index)),
		[-7, 22, 0x1234567]
	);
	const destination = fixture.nativeHeap.allocate(12n);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.GetIntArrayRegion",
		[JNI_ENVIRONMENT, handle, 0n, 3n, destination]
	);
	assert.deepEqual(
		readInt32Values(fixture.memory, destination, 3),
		[-7, 22, 0x1234567]
	);
});

test("GetIntArrayElements honors JNI_COMMIT zero release and JNI_ABORT", () => {
	const fixture = createPrimitiveArrayFixture();
	const handle = newIntArray(fixture);
	const seed = fixture.nativeHeap.allocate(12n);
	writeInt32Values(fixture.memory, seed, [1, 2, 3]);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.SetIntArrayRegion",
		[JNI_ENVIRONMENT, handle, 0n, 3n, seed]
	);
	const isCopy = fixture.nativeHeap.allocate(1n);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.GetIntArrayElements",
		[JNI_ENVIRONMENT, handle, isCopy]
	);
	const pointer = fixture.registers.read(0, 64, "zero");
	assert.equal(fixture.memory.read(isCopy, 1)[0], 1);
	writeInt32Values(fixture.memory, pointer, [4, 5, 6]);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.ReleaseIntArrayElements",
		[JNI_ENVIRONMENT, handle, pointer, 1n]
	);
	const target = fixture.references.find(handle).target;
	assert.deepEqual([0, 1, 2].map(index => fixture.heap.arrayGet(target, index)), [4, 5, 6]);
	assert.ok(fixture.nativeHeap.allocation(pointer));
	writeInt32Values(fixture.memory, pointer, [7, 8, 9]);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.ReleaseIntArrayElements",
		[JNI_ENVIRONMENT, handle, pointer, 0n]
	);
	assert.deepEqual([0, 1, 2].map(index => fixture.heap.arrayGet(target, index)), [7, 8, 9]);
	assert.equal(fixture.nativeHeap.allocation(pointer), null);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.GetIntArrayElements",
		[JNI_ENVIRONMENT, handle, 0n]
	);
	const aborted = fixture.registers.read(0, 64, "zero");
	writeInt32Values(fixture.memory, aborted, [90, 91, 92]);
	invokePrimitiveArray(
		fixture,
		"JNINativeInterface.ReleaseIntArrayElements",
		[JNI_ENVIRONMENT, handle, aborted, 2n]
	);
	assert.deepEqual([0, 1, 2].map(index => fixture.heap.arrayGet(target, index)), [7, 8, 9]);
	assert.equal(fixture.nativeHeap.allocation(aborted), null);
});
