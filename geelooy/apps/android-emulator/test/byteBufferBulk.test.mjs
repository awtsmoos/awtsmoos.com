//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createByteBufferFixture } from "./byteBufferFixture.mjs";

/**
 * Proves the authentic Flutter encoder path: allocateDirect, put(byte[]), and
 * immutable byte snapshot. The Awtsmoos creates capacity, guest array, cursor,
 * and returned buffer anew; Awtsmoos.com measures generic NIO rather than a codec
 * shortcut.
 */
test("ByteBuffer allocateDirect and put byte array preserve all bytes", () => {
	const fixture = createByteBufferFixture();
	const values = Array.from({ length: 23 }, (_, index) => index - 11);
	const source = fixture.array(values);
	const buffer = fixture.allocateDirect(23);
	const returned = fixture.bufferCall(
		"put",
		"([B)Ljava/nio/ByteBuffer;",
		[buffer, source]
	);
	assert.equal(returned, buffer);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 23);
	assert.equal(fixture.bufferCall("isDirect", "()Z", [buffer]), 1);
	assert.deepEqual(
		fixture.snapshot(buffer).bytes,
		values.map(value => value & 0xff)
	);
});

test("ByteBuffer bulk get copies bytes after flip", () => {
	const fixture = createByteBufferFixture();
	const source = fixture.array([1, -1, 3, 4]);
	const buffer = fixture.allocateDirect(4);
	fixture.bufferCall("put", "([B)Ljava/nio/ByteBuffer;", [buffer, source]);
	fixture.stateCall("flip", "()Ljava/nio/Buffer;", [buffer]);
	const target = fixture.array([0, 0, 0, 0]);
	fixture.bufferCall("get", "([B)Ljava/nio/ByteBuffer;", [buffer, target]);
	assert.deepEqual(
		[0, 1, 2, 3].map(index => fixture.heap.arrayGet(target, index)),
		[1, -1, 3, 4]
	);
	assert.equal(fixture.stateCall("remaining", "()I", [buffer]), 0);
});

test("ByteBuffer overflow leaves position unchanged", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocateDirect(2);
	const source = fixture.array([1, 2, 3]);
	assert.throws(
		() => fixture.bufferCall(
			"put",
			"([B)Ljava/nio/ByteBuffer;",
			[buffer, source]
		),
		error => error.code === "ANDROID_BUFFER_UNDERFLOW_OVERFLOW"
	);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 0);
});
