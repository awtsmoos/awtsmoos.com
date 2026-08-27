//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	ANDROID_BITMAP,
	ANDROID_BITMAP_CONFIG
} from "../core/android/frameworkAndroidBitmapTypes.js";
import {
	createAndroidBitmapFixture,
	invokeBitmap
} from "./androidBitmapFixture.mjs";

/**
 * Proves Bitmap creation, RGBA-backed ARGB pixels, copy, generation, and recycle.
 * The Awtsmoos recreates color, coordinate, copied vessel, mutation witness, and
 * lifecycle shore anew; Awtsmoos.com uses no native graphics or browser image.
 */
test("ARGB_8888 Bitmap preserves dimensions, bytes, and pixels", () => {
	const fixture = createAndroidBitmapFixture();
	const config = fixture.family.configRegistry.resolve("ARGB_8888");
	const bitmap = createBitmap(fixture, 2, 2, config);
	assert.equal(query(fixture, bitmap, "getWidth", "()I"), 2);
	assert.equal(query(fixture, bitmap, "getHeight", "()I"), 2);
	assert.equal(query(fixture, bitmap, "getRowBytes", "()I"), 8);
	assert.equal(query(fixture, bitmap, "getByteCount", "()I"), 16);
	assert.equal(query(fixture, bitmap, "isMutable", "()Z"), 1);
	assert.equal(query(fixture, bitmap, "hasAlpha", "()Z"), 1);
	assert.equal(query(fixture, bitmap, "getPixel", "(II)I", 0, 0), 0);
	const generation = query(fixture, bitmap, "getGenerationId", "()I");
	mutate(fixture, bitmap, "setPixel", "(III)V", 1, 0, 0xff112233 | 0);
	assert.equal(query(fixture, bitmap, "getPixel", "(II)I", 1, 0), 0xff112233 | 0);
	assert.equal(query(fixture, bitmap, "getGenerationId", "()I"), generation + 1);
});

test("eraseColor and copy create independent equal pixel storage", () => {
	const fixture = createAndroidBitmapFixture();
	const config = fixture.family.configRegistry.resolve("ARGB_8888");
	const bitmap = createBitmap(fixture, 2, 1, config);
	mutate(fixture, bitmap, "eraseColor", "(I)V", 0x80402010 | 0);
	assert.equal(query(fixture, bitmap, "getPixel", "(II)I", 0, 0), 0x80402010 | 0);
	const copy = mutate(
		fixture,
		bitmap,
		"copy",
		"(Landroid/graphics/Bitmap$Config;Z)Landroid/graphics/Bitmap;",
		config,
		1
	);
	assert.equal(query(fixture, bitmap, "sameAs", "(Landroid/graphics/Bitmap;)Z", copy), 1);
	mutate(fixture, copy, "setPixel", "(III)V", 0, 0, 0xff000000 | 0);
	assert.equal(query(fixture, bitmap, "sameAs", "(Landroid/graphics/Bitmap;)Z", copy), 0);
});

test("RGB_565 converts deterministically and recycle seals access", () => {
	const fixture = createAndroidBitmapFixture();
	const config = fixture.family.configRegistry.resolve("RGB_565");
	const bitmap = createBitmap(fixture, 1, 1, config);
	mutate(fixture, bitmap, "setPixel", "(III)V", 0, 0, 0xffff0000 | 0);
	const color = query(fixture, bitmap, "getPixel", "(II)I", 0, 0);
	assert.equal((color >>> 16) & 0xff, 255);
	assert.equal(color & 0xffff, 0);
	mutate(fixture, bitmap, "recycle", "()V");
	assert.equal(query(fixture, bitmap, "isRecycled", "()Z"), 1);
	assert.throws(() => query(fixture, bitmap, "getWidth", "()I"), /ANDROID_BITMAP_RECYCLED/);
});

test("Bitmap rejects out-of-range pixels and impossible dimensions", () => {
	const fixture = createAndroidBitmapFixture();
	const config = fixture.family.configRegistry.resolve("ARGB_8888");
	const bitmap = createBitmap(fixture, 1, 1, config);
	assert.throws(
		() => query(fixture, bitmap, "getPixel", "(II)I", 1, 0),
		/ANDROID_BITMAP_PIXEL_BOUNDS/
	);
	assert.throws(() => createBitmap(fixture, 0, 1, config), /ANDROID_BITMAP_DIMENSION/);
});

function createBitmap(fixture, width, height, config) {
	return invokeBitmap(
		fixture,
		ANDROID_BITMAP,
		"createBitmap",
		"(IILandroid/graphics/Bitmap$Config;)Landroid/graphics/Bitmap;",
		[width, height, config]
	);
}

function query(fixture, bitmap, name, descriptor, ...args) {
	return invokeBitmap(fixture, ANDROID_BITMAP, name, descriptor, [bitmap, ...args]);
}

function mutate(fixture, bitmap, name, descriptor, ...args) {
	return invokeBitmap(fixture, ANDROID_BITMAP, name, descriptor, [bitmap, ...args]);
}
