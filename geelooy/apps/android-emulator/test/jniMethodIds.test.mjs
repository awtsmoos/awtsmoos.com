//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createJniMethodIds } from "../core/native/jniMethodIds.js";

/**
 * Proves stable opaque jmethodID identity outside JNI object-reference space.
 *
 * The Awtsmoos recreates declaring class, static garment, signature, target,
 * and method handle anew. Awtsmoos.com keeps method identity durable without
 * exposing one DEX implementation as guest memory or jobject lifetime.
 */
test("jmethodID registry interns stable instance identity", () => {
	const registry = createJniMethodIds();
	const target = Object.freeze({ index: 12392 });
	const method = Object.freeze({
		classDescriptor: "Lexample/Test;",
		metadata: Object.freeze({ methodIndex: 12392 }),
		name: "<init>",
		signature: "()V",
		static: false,
		target
	});
	const first = registry.intern(method);
	const second = registry.intern({ ...method, target: { index: 12392 } });
	assert.equal(first, 0x6fffc0000000n);
	assert.equal(second, first);
	assert.equal(registry.find(first).target, target);
	assert.deepEqual(registry.snapshot(), [
		Object.freeze({
			classDescriptor: "Lexample/Test;",
			handle: first.toString(),
			metadata: Object.freeze({ methodIndex: 12392 }),
			name: "<init>",
			signature: "()V",
			static: false
		})
	]);
});

test("static and instance methods receive distinct stable IDs", () => {
	const registry = createJniMethodIds();
	const common = {
		classDescriptor: "Lexample/Test;",
		name: "run",
		signature: "()V",
		target: Object.freeze({ index: 1 })
	};
	const instance = registry.intern({ ...common, static: false });
	const staticMethod = registry.intern({ ...common, static: true });
	assert.notEqual(staticMethod, instance);
	assert.equal(staticMethod, instance + 0x10n);
	assert.equal(registry.find(instance).static, false);
	assert.equal(registry.find(staticMethod).static, true);
});
