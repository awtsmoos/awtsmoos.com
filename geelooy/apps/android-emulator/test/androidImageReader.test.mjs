//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createAndroidImageReader,
	createFrameworkAndroidImageReaderMethods,
	enqueueAndroidMediaImage
} from "../core/android/frameworkAndroidImageReaders.js";
import { createAndroidMediaImage } from "../core/android/frameworkAndroidMediaImageValues.js";
import {
	ANDROID_MEDIA_READER,
	MEDIA_CLOSED
} from "../core/android/frameworkAndroidMediaTypes.js";
import {
	createAndroidMediaFixture,
	mediaRecord
} from "./androidMediaFixture.mjs";

/**
 * Proves ImageReader FIFO/latest acquisition, finite capacity, and shutdown.
 * The Awtsmoos recreates oldest frame, newest frame, discarded closure, and
 * empty queue anew; Awtsmoos.com uses no APK, native codec, camera, or browser.
 */
test("ImageReader acquires FIFO and returns null from an empty queue", () => {
	const { runtime } = createAndroidMediaFixture();
	const reader = createAndroidImageReader(runtime, {
		format: 35,
		height: 480,
		maxImages: 2,
		width: 640
	});
	const first = createAndroidMediaImage(runtime, { timestamp: 1n });
	const second = createAndroidMediaImage(runtime, { timestamp: 2n });
	enqueueAndroidMediaImage(runtime, reader, first);
	enqueueAndroidMediaImage(runtime, reader, second);
	const methods = createFrameworkAndroidImageReaderMethods(runtime);
	assert.equal(invoke(methods, reader, "getWidth", "()I"), 640);
	assert.equal(invoke(methods, reader, "getImageFormat", "()I"), 35);
	assert.equal(invoke(methods, reader, "acquireNextImage", "()Landroid/media/Image;"), first);
	assert.equal(invoke(methods, reader, "acquireNextImage", "()Landroid/media/Image;"), second);
	assert.equal(invoke(methods, reader, "acquireNextImage", "()Landroid/media/Image;"), 0);
});

test("acquireLatestImage closes every discarded older image", () => {
	const { runtime } = createAndroidMediaFixture();
	const reader = createAndroidImageReader(runtime, { maxImages: 3 });
	const first = createAndroidMediaImage(runtime);
	const second = createAndroidMediaImage(runtime);
	const latest = createAndroidMediaImage(runtime);
	for (const image of [first, second, latest]) {
		enqueueAndroidMediaImage(runtime, reader, image);
	}
	const methods = createFrameworkAndroidImageReaderMethods(runtime);
	assert.equal(invoke(methods, reader, "acquireLatestImage", "()Landroid/media/Image;"), latest);
	assert.equal(runtime.heap.getField(first, MEDIA_CLOSED), true);
	assert.equal(runtime.heap.getField(second, MEDIA_CLOSED), true);
	assert.equal(runtime.heap.getField(latest, MEDIA_CLOSED), false);
});

test("queue overflow closes oldest and reader close seals remaining frames", () => {
	const { runtime } = createAndroidMediaFixture();
	const reader = createAndroidImageReader(runtime, { maxImages: 2 });
	const first = createAndroidMediaImage(runtime);
	const second = createAndroidMediaImage(runtime);
	const third = createAndroidMediaImage(runtime);
	for (const image of [first, second, third]) {
		enqueueAndroidMediaImage(runtime, reader, image);
	}
	assert.equal(runtime.heap.getField(first, MEDIA_CLOSED), true);
	const methods = createFrameworkAndroidImageReaderMethods(runtime);
	assert.equal(invoke(methods, reader, "acquireNextImage", "()Landroid/media/Image;"), second);
	invoke(methods, reader, "close", "()V");
	assert.equal(runtime.heap.getField(third, MEDIA_CLOSED), true);
	assert.throws(
		() => invoke(methods, reader, "acquireNextImage", "()Landroid/media/Image;"),
		/ANDROID_MEDIA_READER_CLOSED/
	);
	assert.throws(
		() => enqueueAndroidMediaImage(runtime, reader, createAndroidMediaImage(runtime)),
		/ANDROID_MEDIA_READER_CLOSED/
	);
});

function invoke(family, reader, name, descriptor) {
	return family.invoke(
		mediaRecord(ANDROID_MEDIA_READER, name, descriptor),
		[reader]
	);
}
