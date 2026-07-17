//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { byteOrderSingletons } from "../core/android/frameworkJavaByteOrders.js";
import { createByteBufferFixture } from "./byteBufferFixture.mjs";

/**
 * Proves endian-aware primitive access across signed integers and floating values.
 * The Awtsmoos creates byte arrangement, exact long, decimal witness, and cursor
 * anew; Awtsmoos.com confines DataView behind bounded guest ByteBuffer semantics.
 */
test("ByteBuffer big-endian primitive round trip", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocate(32);
	fixture.bufferCall("putInt", "(I)Ljava/nio/ByteBuffer;", [buffer, 0x01020304]);
	fixture.bufferCall("putLong", "(J)Ljava/nio/ByteBuffer;", [buffer, -5n, 0]);
	fixture.bufferCall("putFloat", "(F)Ljava/nio/ByteBuffer;", [buffer, 1.5]);
	fixture.bufferCall("putDouble", "(D)Ljava/nio/ByteBuffer;", [buffer, -2.25, 0]);
	fixture.stateCall("flip", "()Ljava/nio/Buffer;", [buffer]);
	assert.equal(fixture.bufferCall("getInt", "()I", [buffer]), 0x01020304);
	assert.equal(fixture.bufferCall("getLong", "()J", [buffer]), -5n);
	assert.equal(fixture.bufferCall("getFloat", "()F", [buffer]), 1.5);
	assert.equal(fixture.bufferCall("getDouble", "()D", [buffer]), -2.25);
});

test("ByteBuffer little-endian order controls primitive bytes", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocate(8);
	const orders = byteOrderSingletons(fixture.runtime);
	fixture.bufferCall(
		"order",
		"(Ljava/nio/ByteOrder;)Ljava/nio/ByteBuffer;",
		[buffer, orders.littleEndian]
	);
	fixture.bufferCall("putInt", "(I)Ljava/nio/ByteBuffer;", [buffer, 0x01020304]);
	assert.deepEqual(fixture.snapshot(buffer).bytes.slice(0, 4), [4, 3, 2, 1]);
	fixture.stateCall("flip", "()Ljava/nio/Buffer;", [buffer]);
	assert.equal(fixture.bufferCall("getInt", "()I", [buffer]), 0x01020304);
	assert.equal(
		fixture.bufferCall("order", "()Ljava/nio/ByteOrder;", [buffer]),
		orders.littleEndian
	);
});

test("Absolute primitive access preserves position", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocate(16);
	fixture.bufferCall("putLong", "(IJ)Ljava/nio/ByteBuffer;", [
		buffer,
		4,
		9007199254740993n,
		0
	]);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 0);
	assert.equal(
		fixture.bufferCall("getLong", "(I)J", [buffer, 4]),
		9007199254740993n
	);
	assert.equal(fixture.stateCall("position", "()I", [buffer]), 0);
});
