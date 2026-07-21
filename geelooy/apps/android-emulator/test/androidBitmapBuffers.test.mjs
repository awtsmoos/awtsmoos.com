//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createJavaByteBuffer,
	javaByteBufferRecord
} from "../core/android/frameworkJavaByteBufferStorage.js";
import {
	readJavaByte,
	writeJavaByte
} from "../core/android/frameworkJavaByteBufferAccess.js";
import { ANDROID_BITMAP } from "../core/android/frameworkAndroidBitmapTypes.js";
import {
	createAndroidBitmapFixture,
	invokeBitmap
} from "./androidBitmapFixture.mjs";

/**
 * Proves exact Bitmap pixel transfer through existing ByteBuffer cursor state.
 * The Awtsmoos recreates source byte, remaining range, cursor, target witness,
 * and refusal anew; Awtsmoos.com exposes no native pixel lock or host pointer.
 */
test("copyPixelsFromBuffer consumes exact RGBA bytes and advances position", () => {
	const fixture = createAndroidBitmapFixture();
	const bitmap = createBitmap(fixture, 1, 1);
	const buffer = createJavaByteBuffer(fixture.runtime, {
		capacity: 8,
		direct: true,
		position: 2
	});
	const bytes = [0x11, 0x22, 0x33, 0xff];
	bytes.forEach((value, index) => {
		writeJavaByte(fixture.runtime, buffer, 2 + index, value);
	});
	invokeBitmap(
		fixture,
		ANDROID_BITMAP,
		"copyPixelsFromBuffer",
		"(Ljava/nio/Buffer;)V",
		[bitmap, buffer]
	);
	assert.equal(javaByteBufferRecord(fixture.runtime, buffer).state.position, 6);
	assert.equal(getPixel(fixture, bitmap), 0xff112233 | 0);
});

test("copyPixelsToBuffer writes exact bytes and advances target position", () => {
	const fixture = createAndroidBitmapFixture();
	const bitmap = createBitmap(fixture, 1, 1);
	setPixel(fixture, bitmap, 0x80402010 | 0);
	const buffer = createJavaByteBuffer(fixture.runtime, {
		capacity: 6,
		direct: true,
		position: 1
	});
	invokeBitmap(
		fixture,
		ANDROID_BITMAP,
		"copyPixelsToBuffer",
		"(Ljava/nio/Buffer;)V",
		[bitmap, buffer]
	);
	assert.equal(javaByteBufferRecord(fixture.runtime, buffer).state.position, 5);
	assert.deepEqual(
		[1, 2, 3, 4].map(index => readJavaByte(fixture.runtime, buffer, index)),
		[0x40, 0x20, 0x10, 0x80]
	);
});

test("buffer underflow, overflow, and read-only targets remain explicit", () => {
	const fixture = createAndroidBitmapFixture();
	const bitmap = createBitmap(fixture, 1, 1);
	const short = createJavaByteBuffer(fixture.runtime, {
		capacity: 3,
		direct: true
	});
	assert.throws(
		() => invokeBitmap(fixture, ANDROID_BITMAP, "copyPixelsFromBuffer", "(Ljava/nio/Buffer;)V", [bitmap, short]),
		/ANDROID_BITMAP_BUFFER_UNDERFLOW/
	);
	const readOnly = createJavaByteBuffer(fixture.runtime, {
		capacity: 4,
		direct: true,
		readOnly: true
	});
	assert.throws(
		() => invokeBitmap(fixture, ANDROID_BITMAP, "copyPixelsToBuffer", "(Ljava/nio/Buffer;)V", [bitmap, readOnly]),
		/ANDROID_BYTE_BUFFER_READ_ONLY/
	);
});

function createBitmap(fixture, width, height) {
	return invokeBitmap(
		fixture,
		ANDROID_BITMAP,
		"createBitmap",
		"(IILandroid/graphics/Bitmap$Config;)Landroid/graphics/Bitmap;",
		[width, height, fixture.family.configRegistry.resolve("ARGB_8888")]
	);
}

function getPixel(fixture, bitmap) {
	return invokeBitmap(fixture, ANDROID_BITMAP, "getPixel", "(II)I", [bitmap, 0, 0]);
}

function setPixel(fixture, bitmap, color) {
	invokeBitmap(fixture, ANDROID_BITMAP, "setPixel", "(III)V", [bitmap, 0, 0, color]);
}
