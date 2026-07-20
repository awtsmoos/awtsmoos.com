//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkBootstrapResolver } from "../core/native/frameworkBootstrapResolver.js";

/**
 * Proves media classes and exact JNI method identities are resolver-visible.
 *
 * The Awtsmoos recreates Image class, latest acquisition, Plane buffer, static
 * HardwareBuffer creation, and unknown boundary anew. Awtsmoos.com exposes only
 * methods backed by the pure-JavaScript Android media family.
 */
test("media classes resolve as implemented framework identities", () => {
	const resolver = createFrameworkBootstrapResolver();
	for (const descriptor of [
		"Landroid/media/Image;",
		"Landroid/media/Image$Plane;",
		"Landroid/media/ImageReader;",
		"Landroid/hardware/HardwareBuffer;"
	]) {
		const resolved = resolver.resolveClass(descriptor);
		assert.equal(resolved?.descriptor, descriptor);
		assert.equal(resolved?.kind, "framework-class");
	}
});

test("Image and ImageReader methods resolve with exact signatures", () => {
	const resolver = createFrameworkBootstrapResolver();
	const image = resolver.resolveMethod(request(
		"Landroid/media/Image;",
		"getPlanes",
		"()[Landroid/media/Image$Plane;"
	));
	assert.equal(image.implementation.family, "frameworkAndroidMediaImages");
	assert.equal(image.method.classType, "Landroid/media/Image;");
	const latest = resolver.resolveMethod(request(
		"Landroid/media/ImageReader;",
		"acquireLatestImage",
		"()Landroid/media/Image;"
	));
	assert.equal(latest.method.name, "acquireLatestImage");
	assert.equal(latest.implementation.accessFlags, 0);
});

test("HardwareBuffer.create resolves only as static", () => {
	const resolver = createFrameworkBootstrapResolver();
	const signature = "(IIIIJ)Landroid/hardware/HardwareBuffer;";
	const created = resolver.resolveMethod(request(
		"Landroid/hardware/HardwareBuffer;",
		"create",
		signature,
		true
	));
	assert.equal(created.implementation.accessFlags, 0x0008);
	assert.equal(resolver.resolveMethod(request(
		"Landroid/hardware/HardwareBuffer;",
		"create",
		signature,
		false
	)), null);
	assert.equal(resolver.resolveMethod(request(
		"Landroid/media/Image;",
		"unknown",
		"()V"
	)), null);
});

function request(classDescriptor, name, signature, staticMethod = false) {
	return Object.freeze({
		classDescriptor,
		name,
		signature,
		static: staticMethod
	});
}
