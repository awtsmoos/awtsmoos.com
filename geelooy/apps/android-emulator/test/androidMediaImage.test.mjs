//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidMediaImageMethods } from "../core/android/frameworkAndroidMediaImages.js";
import { createAndroidMediaImage } from "../core/android/frameworkAndroidMediaImageValues.js";
import { createFrameworkAndroidMediaPlaneMethods } from "../core/android/frameworkAndroidMediaPlanes.js";
import {
	ANDROID_HARDWARE_BUFFER,
	ANDROID_MEDIA_IMAGE,
	ANDROID_MEDIA_PLANE
} from "../core/android/frameworkAndroidMediaTypes.js";
import {
	createAndroidMediaFixture,
	mediaRecord
} from "./androidMediaFixture.mjs";

/**
 * Proves bounded Image, Plane, crop Rect, and HardwareBuffer guest behavior.
 * The Awtsmoos recreates dimension, plane array, timestamp, crop, buffer, and
 * close boundary anew; Awtsmoos.com uses no APK, native memory, GPU, or camera.
 */
test("Image exposes configured values through genuine guest objects", () => {
	const { runtime } = createAndroidMediaFixture();
	const byteBuffer = runtime.heap.allocate("Ljava/nio/ByteBuffer;");
	const image = createAndroidMediaImage(runtime, {
		format: 35,
		hardwareBuffer: true,
		height: 480,
		planes: [{ buffer: byteBuffer, pixelStride: 1, rowStride: 640 }],
		scalingMode: 2,
		timestamp: 123456789n,
		transform: 1,
		usage: 9n,
		width: 640
	});
	const images = createFrameworkAndroidMediaImageMethods(runtime);
	assert.equal(invoke(images, runtime, image, "getWidth", "()I"), 640);
	assert.equal(invoke(images, runtime, image, "getHeight", "()I"), 480);
	assert.equal(invoke(images, runtime, image, "getFormat", "()I"), 35);
	assert.equal(invoke(images, runtime, image, "getTimestamp", "()J"), 123456789n);
	assert.equal(invoke(images, runtime, image, "getTransform", "()I"), 1);
	assert.equal(invoke(images, runtime, image, "getScalingMode", "()I"), 2);
	const crop = invoke(images, runtime, image, "getCropRect", "()Landroid/graphics/Rect;");
	assert.equal(runtime.heap.getField(crop, "Landroid/graphics/Rect;->right:I"), 640);
	assert.equal(runtime.heap.getField(crop, "Landroid/graphics/Rect;->bottom:I"), 480);
	const planesArray = invoke(images, runtime, image, "getPlanes", "()[Landroid/media/Image$Plane;");
	assert.equal(runtime.heap.arrayLength(planesArray), 1);
	const plane = runtime.heap.arrayGet(planesArray, 0);
	const planeMethods = createFrameworkAndroidMediaPlaneMethods(runtime);
	assert.equal(invokePlane(planeMethods, runtime, plane, "getRowStride", "()I"), 640);
	assert.equal(invokePlane(planeMethods, runtime, plane, "getPixelStride", "()I"), 1);
	assert.equal(invokePlane(planeMethods, runtime, plane, "getBuffer", "()Ljava/nio/ByteBuffer;"), byteBuffer);
	const buffer = invoke(images, runtime, image, "getHardwareBuffer", "()Landroid/hardware/HardwareBuffer;");
	assert.equal(invokeBuffer(planeMethods, runtime, buffer, "getWidth", "()I"), 640);
	assert.equal(invokeBuffer(planeMethods, runtime, buffer, "getUsage", "()J"), 9n);
	invoke(images, runtime, image, "close", "()V");
	assert.throws(
		() => invoke(images, runtime, image, "getWidth", "()I"),
		/ANDROID_MEDIA_IMAGE_CLOSED/
	);
	assert.equal(invokeBuffer(planeMethods, runtime, buffer, "isClosed", "()Z"), 1);
});

test("HardwareBuffer.create returns an isolated closable guest buffer", () => {
	const { runtime } = createAndroidMediaFixture();
	const methods = createFrameworkAndroidMediaPlaneMethods(runtime);
	const created = methods.invoke(
		mediaRecord(ANDROID_HARDWARE_BUFFER, "create", "(IIIIJ)Landroid/hardware/HardwareBuffer;"),
		[320, 240, 1, 2, 7n]
	);
	assert.equal(invokeBuffer(methods, runtime, created, "getHeight", "()I"), 240);
	assert.equal(invokeBuffer(methods, runtime, created, "getLayers", "()I"), 2);
	assert.equal(invokeBuffer(methods, runtime, created, "isClosed", "()Z"), 0);
	invokeBuffer(methods, runtime, created, "close", "()V");
	assert.equal(invokeBuffer(methods, runtime, created, "isClosed", "()Z"), 1);
});

function invoke(family, runtime, reference, name, descriptor) {
	return family.invoke(mediaRecord(ANDROID_MEDIA_IMAGE, name, descriptor), [reference]);
}

function invokePlane(family, runtime, reference, name, descriptor) {
	return family.invoke(mediaRecord(ANDROID_MEDIA_PLANE, name, descriptor), [reference]);
}

function invokeBuffer(family, runtime, reference, name, descriptor) {
	return family.invoke(mediaRecord(ANDROID_HARDWARE_BUFFER, name, descriptor), [reference]);
}
