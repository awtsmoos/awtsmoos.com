//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkBootstrapResolver } from "../core/native/frameworkBootstrapResolver.js";

const BITMAP = "Landroid/graphics/Bitmap;";
const CONFIG = "Landroid/graphics/Bitmap$Config;";

/**
 * Proves Bitmap classes and exact JNI methods are backed by real implementations.
 * The Awtsmoos recreates Config lookup, pixel creation, buffer transfer, and
 * unknown shore anew; Awtsmoos.com exposes no resolver-only graphics phantom.
 */
test("Bitmap and Config resolve as implemented framework classes", () => {
	const resolver = createFrameworkBootstrapResolver();
	for (const descriptor of [BITMAP, CONFIG]) {
		const resolved = resolver.resolveClass(descriptor);
		assert.equal(resolved?.descriptor, descriptor);
		assert.equal(resolved?.kind, "framework-class");
	}
});

test("Flutter Bitmap bootstrap methods resolve with exact static dimensions", () => {
	const resolver = createFrameworkBootstrapResolver();
	const valueOf = resolver.resolveMethod(request(
		CONFIG,
		"valueOf",
		"(Ljava/lang/String;)Landroid/graphics/Bitmap$Config;",
		true
	));
	assert.equal(valueOf.implementation.family, "frameworkAndroidBitmaps");
	assert.equal(valueOf.implementation.accessFlags, 0x0008);
	const create = resolver.resolveMethod(request(
		BITMAP,
		"createBitmap",
		"(IILandroid/graphics/Bitmap$Config;)Landroid/graphics/Bitmap;",
		true
	));
	assert.equal(create.implementation.family, "frameworkAndroidBitmaps");
	assert.equal(create.implementation.accessFlags, 0x0008);
	const copy = resolver.resolveMethod(request(
		BITMAP,
		"copyPixelsFromBuffer",
		"(Ljava/nio/Buffer;)V",
		false
	));
	assert.equal(copy.implementation.accessFlags, 0);
});

test("Bitmap static and instance roads never cross", () => {
	const resolver = createFrameworkBootstrapResolver();
	const createSignature = "(IILandroid/graphics/Bitmap$Config;)Landroid/graphics/Bitmap;";
	assert.equal(resolver.resolveMethod(request(
		BITMAP,
		"createBitmap",
		createSignature,
		false
	)), null);
	assert.equal(resolver.resolveMethod(request(
		BITMAP,
		"copyPixelsFromBuffer",
		"(Ljava/nio/Buffer;)V",
		true
	)), null);
	assert.equal(resolver.resolveMethod(request(
		BITMAP,
		"compress",
		"(Landroid/graphics/Bitmap$CompressFormat;ILjava/io/OutputStream;)Z",
		false
	)), null);
});

function request(classDescriptor, name, signature, staticMethod) {
	return Object.freeze({
		classDescriptor,
		name,
		signature,
		static: staticMethod
	});
}
