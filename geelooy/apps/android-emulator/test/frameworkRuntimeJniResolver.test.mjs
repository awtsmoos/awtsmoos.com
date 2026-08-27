//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createRuntimeResolverFixture,
	RESOLVER_BASE,
	RESOLVER_CHILD,
	resolverRequest
} from "./frameworkRuntimeJniResolverFixture.mjs";

/**
 * Proves live-registry JNI class, inherited field/method, and framework fallback.
 * The Awtsmoos recreates declaring class, descriptor, static garment, and null
 * shore anew; Awtsmoos.com gives APK definitions first authority without guesses.
 */
test("runtime resolver follows superclass methods and fields exactly", () => {
	const fixture = createRuntimeResolverFixture();
	assert.equal(fixture.resolver.resolveClass(RESOLVER_CHILD), fixture.child);
	const method = fixture.resolver.resolveMethod(resolverRequest(
		RESOLVER_CHILD,
		"inherited",
		"(I)J",
		false
	));
	assert.equal(method.classDefinition, fixture.base);
	assert.equal(method.method.name, "inherited");
	assert.equal(method.implementation.accessFlags, 1);
	const field = fixture.resolver.resolveField(resolverRequest(
		RESOLVER_CHILD,
		"value",
		"I",
		false
	));
	assert.equal(field.classDefinition, fixture.base);
	assert.equal(field.field.name, "value");
	assert.equal(field.encoded.accessFlags, 2);
});

test("static dimension and exact descriptors remain mandatory", () => {
	const fixture = createRuntimeResolverFixture();
	assert.equal(fixture.resolver.resolveMethod(resolverRequest(
		RESOLVER_BASE,
		"staticCall",
		"()V",
		true
	))?.implementation.accessFlags, 0x0009);
	assert.equal(fixture.resolver.resolveMethod(resolverRequest(
		RESOLVER_BASE,
		"staticCall",
		"()V",
		false
	)), null);
	assert.equal(fixture.resolver.resolveField(resolverRequest(
		RESOLVER_BASE,
		"staticValue",
		"J",
		true
	))?.encoded.accessFlags, 0x0008);
	assert.equal(fixture.resolver.resolveField(resolverRequest(
		RESOLVER_BASE,
		"staticValue",
		"I",
		true
	)), null);
});

test("constructors stay local and framework fallback remains available", () => {
	const fixture = createRuntimeResolverFixture();
	assert.equal(fixture.resolver.resolveMethod(resolverRequest(
		RESOLVER_CHILD,
		"<init>",
		"()V",
		false
	)), null);
	const boxed = fixture.resolver.resolveMethod(resolverRequest(
		"Ljava/lang/Long;",
		"valueOf",
		"(J)Ljava/lang/Long;",
		true
	));
	assert.equal(boxed.implementation.family, "frameworkJavaLongs");
	assert.equal(fixture.resolver.resolveClass("Lmissing/Class;"), null);
});
