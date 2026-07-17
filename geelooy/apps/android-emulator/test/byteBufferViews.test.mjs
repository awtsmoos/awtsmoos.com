//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createByteBufferFixture } from "./byteBufferFixture.mjs";

/**
 * Proves shared backing across arrays, duplicates, slices, and read-only views.
 * The Awtsmoos creates alias, cursor, compacted shore, and guarded mutation anew;
 * Awtsmoos.com preserves Java view identity without copying guest bytes.
 */
test("ByteBuffer.wrap exposes and mutates the guest array", () => {
	const fixture = createByteBufferFixture();
	const array = fixture.array([1, 2, 3, 4]);
	const buffer = fixture.bufferCall(
		"wrap",
		"([B)Ljava/nio/ByteBuffer;",
		[array]
	);
	assert.equal(fixture.bufferCall("array", "()[B", [buffer]), array);
	assert.equal(fixture.bufferCall("hasArray", "()Z", [buffer]), 1);
	fixture.bufferCall("put", "(IB)Ljava/nio/ByteBuffer;", [buffer, 1, 9]);
	assert.equal(fixture.heap.arrayGet(array, 1), 9);
});

test("Duplicate and slice share bytes with independent positions", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocate(6);
	fixture.bufferCall("put", "([B)Ljava/nio/ByteBuffer;", [
		buffer,
		fixture.array([1, 2, 3, 4, 5, 6])
	]);
	fixture.stateCall("position", "(I)Ljava/nio/Buffer;", [buffer, 2]);
	const duplicate = fixture.bufferCall(
		"duplicate",
		"()Ljava/nio/ByteBuffer;",
		[buffer]
	);
	const slice = fixture.bufferCall("slice", "()Ljava/nio/ByteBuffer;", [buffer]);
	fixture.bufferCall("put", "(IB)Ljava/nio/ByteBuffer;", [slice, 0, 99]);
	assert.equal(fixture.bufferCall("get", "(I)B", [buffer, 2]), 99);
	fixture.stateCall("position", "(I)Ljava/nio/Buffer;", [duplicate, 4]);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 2);
});

test("Read-only ByteBuffer rejects writes without moving position", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocate(4);
	const readOnly = fixture.bufferCall(
		"asReadOnlyBuffer",
		"()Ljava/nio/ByteBuffer;",
		[buffer]
	);
	assert.equal(fixture.bufferCall("isReadOnly", "()Z", [readOnly]), 1);
	assert.throws(
		() => fixture.bufferCall(
			"put",
			"(B)Ljava/nio/ByteBuffer;",
			[readOnly, 7]
		),
		error => error.code === "ANDROID_BYTE_BUFFER_READ_ONLY"
	);
	assert.equal(fixture.stateCall("position", "()I", [readOnly]), 0);
});

test("ByteBuffer compact moves remaining bytes to the beginning", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocate(5);
	fixture.bufferCall("put", "([B)Ljava/nio/ByteBuffer;", [
		buffer,
		fixture.array([1, 2, 3, 4, 5])
	]);
	fixture.stateCall("flip", "()Ljava/nio/Buffer;", [buffer]);
	fixture.stateCall("position", "(I)Ljava/nio/Buffer;", [buffer, 2]);
	fixture.bufferCall("compact", "()Ljava/nio/ByteBuffer;", [buffer]);
	assert.deepEqual(fixture.snapshot(buffer).bytes.slice(0, 3), [3, 4, 5]);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 3);
	assert.equal(fixture.stateCall("limit", "()I", [buffer]), 5);
});
