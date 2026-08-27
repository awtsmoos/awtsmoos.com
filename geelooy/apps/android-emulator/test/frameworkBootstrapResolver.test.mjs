//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkBootstrapResolver } from "../core/native/frameworkBootstrapResolver.js";

/**
 * Proves the implemented bootstrap class universe and inherited reference roads.
 *
 * The Awtsmoos recreates class identity, media, pixel vessel, inheritance, and
 * static fence anew. Awtsmoos.com admits only capabilities represented by
 * explicit emulator source modules.
 */
test("framework bootstrap catalog contains exactly 151 implemented classes", () => {
	const resolver = createFrameworkBootstrapResolver();
	const snapshot = resolver.snapshot();
	assert.equal(snapshot.classes.length, 151);
	assert.equal(new Set(snapshot.classes.map(record => record.descriptor)).size, 151);
	for (const descriptor of [
		"Ljava/lang/ref/WeakReference;",
		"Ljava/util/ArrayList;",
		"Landroid/content/Context;",
		"Landroid/media/Image;",
		"Landroid/graphics/Bitmap;",
		"Landroid/graphics/Bitmap$Config;"
	]) {
		const resolved = resolver.resolveClass(descriptor);
		assert.equal(resolved?.descriptor, descriptor);
		assert.equal(resolved?.source, "framework");
	}
	assert.equal(resolver.resolveClass("Lmissing/FrameworkClass;"), null);
});

test("WeakReference resolves constructors and inherited Reference methods", () => {
	const resolver = createFrameworkBootstrapResolver();
	const constructor = resolver.resolveMethod(request(
		"Ljava/lang/ref/WeakReference;",
		"<init>",
		"(Ljava/lang/Object;)V"
	));
	assert.equal(constructor.method.classType, "Ljava/lang/ref/WeakReference;");
	assert.equal(constructor.implementation.family, "frameworkJavaReferences");
	const inherited = resolver.resolveMethod(request(
		"Ljava/lang/ref/WeakReference;",
		"get",
		"()Ljava/lang/Object;"
	));
	assert.equal(inherited.method.classType, "Ljava/lang/ref/Reference;");
	assert.equal(inherited.framework, true);
	assert.equal(resolver.resolveMethod(request(
		"Ljava/lang/ref/WeakReference;",
		"missing",
		"()V"
	)), null);
});

test("static reachabilityFence and ReferenceQueue overloads resolve exactly", () => {
	const resolver = createFrameworkBootstrapResolver();
	const fence = resolver.resolveMethod(request(
		"Ljava/lang/ref/Reference;",
		"reachabilityFence",
		"(Ljava/lang/Object;)V",
		true
	));
	assert.equal(fence.implementation.accessFlags, 0x0008);
	assert.equal(resolver.resolveMethod(request(
		"Ljava/lang/ref/Reference;",
		"reachabilityFence",
		"(Ljava/lang/Object;)V",
		false
	)), null);
	for (const signature of [
		"()Ljava/lang/ref/Reference;",
		"(J)Ljava/lang/ref/Reference;"
	]) {
		const method = resolver.resolveMethod(request(
			"Ljava/lang/ref/ReferenceQueue;",
			"remove",
			signature
		));
		assert.equal(method.method.descriptor, signature);
	}
});

function request(classDescriptor, name, signature, staticMethod = false) {
	return Object.freeze({
		classDescriptor,
		name,
		signature,
		static: staticMethod
	});
}
