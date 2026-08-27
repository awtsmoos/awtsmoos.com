//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterNativeReferenceScope } from "../core/android/frameworkFlutterNativeReferences.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";

/**
 * Proves Dalvik, raw Java String, null, class, and return JNI identity.
 * The Awtsmoos recreates hidden value, opaque handle, local scope, and return
 * road anew; Awtsmoos.com exposes no heap record or host string as native memory.
 */
test("repeated Dalvik references share one local opaque JNI handle", () => {
	const fixture = createReferenceFixture();
	const object = fixture.runtime.heap.allocate("Lexample/Object;");
	const first = fixture.scope.marshal(object, "Ljava/lang/Object;");
	const second = fixture.scope.marshal(object, "Ljava/lang/Object;");
	assert.equal(second, first);
	const record = fixture.references.find(first);
	assert.equal(record.kind, "object");
	assert.equal(record.scope, "local");
	assert.equal(record.target, object);
	assert.equal(record.metadata.dalvikId, object.id);
});

test("raw runtime Java strings become stable local jstring handles", () => {
	const fixture = createReferenceFixture();
	const first = fixture.scope.marshal("flutter_assets", "Ljava/lang/String;");
	const second = fixture.scope.marshal("flutter_assets", "Ljava/lang/String;");
	const main = fixture.scope.marshal("main", "Ljava/lang/String;");
	assert.equal(second, first);
	assert.notEqual(main, first);
	const record = fixture.references.find(first);
	assert.equal(record.kind, "string");
	assert.equal(record.target, "flutter_assets");
	assert.equal(record.scope, "local");
	assert.equal(
		fixture.scope.recover(first, "Ljava/lang/String;"),
		"flutter_assets"
	);
});

test("null and Dalvik array returns recover exact values", () => {
	const fixture = createReferenceFixture();
	assert.equal(fixture.scope.marshal(0, "Ljava/lang/Object;"), 0n);
	assert.equal(fixture.scope.recover(0n, "Ljava/lang/Object;"), 0);
	const array = fixture.runtime.heap.allocateArray("[Ljava/lang/String;", 2);
	const handle = fixture.scope.marshal(array, "[Ljava/lang/String;");
	assert.equal(fixture.scope.recover(handle, "[Ljava/lang/String;"), array);
});

test("class marshalling uses the production classDefinition registry", () => {
	const fixture = createReferenceFixture();
	const handle = fixture.scope.marshalClass("Lexample/Class;");
	const record = fixture.references.find(handle);
	assert.equal(record.kind, "class");
	assert.equal(record.target, fixture.definition);
});

test("foreign values, unknown classes, and return handles fail", () => {
	const fixture = createReferenceFixture();
	assert.throws(
		() => fixture.scope.marshal(7, "Ljava/lang/Object;"),
		/ANDROID_FLUTTER_NATIVE_REFERENCE_VALUE/
	);
	assert.throws(
		() => fixture.scope.marshalClass("Lmissing/Class;"),
		/ANDROID_FLUTTER_NATIVE_CLASS/
	);
	const foreign = fixture.references.create(
		"object",
		"foreign",
		Object.freeze({}),
		{ scope: "local" }
	);
	assert.throws(
		() => fixture.scope.recover(foreign, "Ljava/lang/Object;"),
		/ANDROID_FLUTTER_NATIVE_RETURN_HANDLE/
	);
});

function createReferenceFixture() {
	const heap = createDalvikObjectHeap();
	const definition = Object.freeze({ type: "Lexample/Class;" });
	const runtime = Object.freeze({
		heap,
		registry: Object.freeze({
			classDefinition(descriptor) {
				return descriptor === definition.type ? definition : null;
			}
		})
	});
	const references = createJniGuestReferences();
	return Object.freeze({
		definition,
		references,
		runtime,
		scope: createFlutterNativeReferenceScope(runtime, references)
	});
}
