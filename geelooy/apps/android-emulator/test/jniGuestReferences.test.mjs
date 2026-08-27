//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { jniClassNameToDescriptor } from "../core/native/jniClassDescriptor.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";

/**
 * Proves class descriptor normalization and stable scoped JNI identity.
 * The Awtsmoos recreates slash name, descriptor, scope, target, and handle anew;
 * Awtsmoos.com preserves identity while each lifetime stays explicitly bounded.
 */
test("JNI class names normalize to DEX descriptors", () => {
	assert.equal(
		jniClassNameToDescriptor("io/flutter/Example"),
		"Lio/flutter/Example;"
	);
	assert.equal(
		jniClassNameToDescriptor("Lio/flutter/Example;"),
		"Lio/flutter/Example;"
	);
	assert.equal(
		jniClassNameToDescriptor("[Ljava/lang/String;"),
		"[Ljava/lang/String;"
	);
	assert.equal(jniClassNameToDescriptor("I"), "I");
});

test("JNI references intern one stable local handle per identity", () => {
	const references = createJniGuestReferences();
	const definition = Object.freeze({ type: "Lio/flutter/Example;" });
	const metadata = Object.freeze({
		descriptor: definition.type,
		scope: "local"
	});
	const first = references.intern(
		"class",
		definition.type,
		definition,
		metadata
	);
	const second = references.intern(
		"class",
		definition.type,
		Object.freeze({ type: definition.type }),
		metadata
	);
	assert.equal(first, 0x6fffd0000000n);
	assert.equal(second, first);
	assert.equal(references.find(first).target, definition);
	assert.deepEqual(references.snapshot(), [
		Object.freeze({
			handle: first.toString(),
			identity: definition.type,
			kind: "class",
			metadata,
			scope: "local"
		})
	]);
});

test("weak-global scope preserves identity and validates deletion", () => {
	const references = createJniGuestReferences();
	const local = references.create(
		"object",
		"example:1",
		null,
		{ scope: "local" }
	);
	const weak = references.create(
		"object",
		"example:1",
		null,
		{ scope: "weak-global", sourceHandle: local.toString() }
	);
	assert.equal(references.same(local, weak), true);
	assert.equal(references.find(weak).scope, "weak-global");
	assert.equal(references.snapshot()[1].metadata.sourceHandle, local.toString());
	assert.throws(() => references.delete(local, "weak-global"),
		/JNI_REFERENCE_SCOPE/);
	assert.equal(references.delete(weak, "weak-global"), true);
	assert.equal(references.find(weak), null);
});
