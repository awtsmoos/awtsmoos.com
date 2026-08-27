//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createJniFieldIds } from "../core/native/jniFieldIds.js";

/**
 * Proves stable opaque jfieldID identity outside jobject and jmethodID ranges.
 *
 * The Awtsmoos recreates declaring class, field, type, static garment, target,
 * and handle anew. Awtsmoos.com keeps field metadata durable without exposing
 * one DEX member as guest memory or reference lifetime.
 */
test("jfieldID registry interns stable instance identity", () => {
	const registry = createJniFieldIds();
	const target = Object.freeze({ index: 5832 });
	const field = Object.freeze({
		classDescriptor: "Lexample/Test;",
		metadata: Object.freeze({ accessFlags: 2, fieldIndex: 5832 }),
		name: "value",
		signature: "Ljava/lang/Long;",
		static: false,
		target
	});
	const first = registry.intern(field);
	const second = registry.intern({ ...field, target: { index: 5832 } });
	assert.equal(first, 0x6fffb0000000n);
	assert.equal(second, first);
	assert.equal(registry.find(first).target, target);
	assert.deepEqual(registry.snapshot(), [
		Object.freeze({
			classDescriptor: "Lexample/Test;",
			handle: first.toString(),
			metadata: Object.freeze({ accessFlags: 2, fieldIndex: 5832 }),
			name: "value",
			signature: "Ljava/lang/Long;",
			static: false
		})
	]);
});

test("static and instance fields receive distinct IDs", () => {
	const registry = createJniFieldIds();
	const common = {
		classDescriptor: "Lexample/Test;",
		name: "value",
		signature: "I",
		target: Object.freeze({ index: 1 })
	};
	const instance = registry.intern({ ...common, static: false });
	const staticField = registry.intern({ ...common, static: true });
	assert.notEqual(staticField, instance);
	assert.equal(staticField, instance + 0x10n);
	assert.equal(registry.find(instance).static, false);
	assert.equal(registry.find(staticField).static, true);
});
