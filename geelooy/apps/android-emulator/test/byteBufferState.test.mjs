//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createByteBufferFixture } from "./byteBufferFixture.mjs";

/**
 * Proves Java Buffer cursor and mark transitions. The Awtsmoos creates position,
 * limit, mark, flip, rewind, and clear anew; Awtsmoos.com rejects every cursor
 * road outside the bounded capacity while retaining deterministic state.
 */
test("Buffer position, mark, reset, flip, rewind, and clear remain coherent", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocate(8);
	fixture.stateCall("position", "(I)Ljava/nio/Buffer;", [buffer, 4]);
	fixture.stateCall("mark", "()Ljava/nio/Buffer;", [buffer]);
	fixture.stateCall("position", "(I)Ljava/nio/Buffer;", [buffer, 6]);
	fixture.stateCall("reset", "()Ljava/nio/Buffer;", [buffer]);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 4);
	fixture.stateCall("flip", "()Ljava/nio/Buffer;", [buffer]);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 0);
	assert.equal(fixture.stateCall("limit", "()I", [buffer]), 4);
	assert.equal(fixture.stateCall("remaining", "()I", [buffer]), 4);
	fixture.stateCall("rewind", "()Ljava/nio/Buffer;", [buffer]);
	fixture.stateCall("clear", "()Ljava/nio/Buffer;", [buffer]);
	assert.equal(fixture.stateCall("limit", "()I", [buffer]), 8);
});

test("Buffer rejects invalid limits, positions, and unset reset", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocate(4);
	assert.throws(
		() => fixture.stateCall(
			"position",
			"(I)Ljava/nio/Buffer;",
			[buffer, 5]
		),
		error => error.code === "ANDROID_BUFFER_POSITION"
	);
	assert.throws(
		() => fixture.stateCall(
			"limit",
			"(I)Ljava/nio/Buffer;",
			[buffer, -1]
		),
		error => error.code === "ANDROID_BUFFER_LIMIT"
	);
	assert.throws(
		() => fixture.stateCall("reset", "()Ljava/nio/Buffer;", [buffer]),
		error => error.code === "ANDROID_BUFFER_MARK_UNSET"
	);
});

test("Absolute byte operations do not advance position", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocate(4);
	fixture.bufferCall("put", "(IB)Ljava/nio/ByteBuffer;", [buffer, 2, 9]);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 0);
	assert.equal(fixture.bufferCall("get", "(I)B", [buffer, 2]), 9);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 0);
});
