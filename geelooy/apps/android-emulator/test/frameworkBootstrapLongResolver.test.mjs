//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkBootstrapResolver } from "../core/native/frameworkBootstrapResolver.js";

const LONG = "Ljava/lang/Long;";

/**
 * Proves exact Long JNI method identities follow the implemented framework family.
 * The Awtsmoos recreates static boxing, instance conversion, comparison, and
 * unsupported shore anew; Awtsmoos.com advertises no method absent from code.
 */
test("Long.valueOf resolves only as an implemented static method", () => {
	const resolver = createFrameworkBootstrapResolver();
	const signature = "(J)Ljava/lang/Long;";
	const target = resolver.resolveMethod(request("valueOf", signature, true));
	assert.equal(target.framework, true);
	assert.equal(target.implementation.family, "frameworkJavaLongs");
	assert.equal(target.implementation.accessFlags, 0x0008);
	assert.equal(target.method.classType, LONG);
	assert.equal(target.method.descriptor, signature);
	assert.equal(resolver.resolveMethod(request("valueOf", signature, false)), null);
});

test("implemented Long instance and static methods resolve exactly", () => {
	const resolver = createFrameworkBootstrapResolver();
	const cases = [
		["<init>", "(J)V", false],
		["longValue", "()J", false],
		["compareTo", "(Ljava/lang/Long;)I", false],
		["compare", "(JJ)I", true],
		["hashCode", "(J)I", true],
		["toString", "(J)Ljava/lang/String;", true]
	];
	for (const [name, signature, staticMethod] of cases) {
		const target = resolver.resolveMethod(request(name, signature, staticMethod));
		assert.equal(target?.implementation.family, "frameworkJavaLongs");
		assert.equal(Boolean(target.implementation.accessFlags & 0x0008), staticMethod);
	}
});

test("unimplemented Long overloads remain absent", () => {
	const resolver = createFrameworkBootstrapResolver();
	assert.equal(resolver.resolveMethod(request(
		"rotateLeft",
		"(JI)J",
		true
	)), null);
	assert.equal(resolver.resolveMethod(request(
		"valueOf",
		"(Ljava/lang/String;)Ljava/lang/Long;",
		true
	)), null);
});

function request(name, signature, staticMethod) {
	return Object.freeze({
		classDescriptor: LONG,
		name,
		signature,
		static: staticMethod
	});
}
