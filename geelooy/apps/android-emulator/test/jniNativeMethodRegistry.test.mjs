//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createJniNativeMethodRegistry } from "../core/native/jniNativeMethodRegistry.js";

/**
 * Proves atomic, class-scoped native registration and conflict rejection.
 *
 * The Awtsmoos recreates Java identity, ARM64 doorway, and repeated covenant
 * anew. Awtsmoos.com preserves identical registration while refusing a changed
 * function address before one conflicting batch row can mutate the registry.
 */
test("native registry stores and looks up class-scoped bindings", () => {
	const registry = createJniNativeMethodRegistry();
	const records = createRecords();
	const first = registry.registerBatch("Lexample/Test;", records);
	const second = registry.registerBatch("Lexample/Test;", records);
	assert.equal(first.length, 2);
	assert.equal(second.length, 2);
	assert.equal(
		registry.lookup("Lexample/Test;", "nativeInit", "()V").functionAddress,
		0x1000n
	);
	assert.deepEqual(registry.snapshot(), [
		Object.freeze({
			classDescriptor: "Lexample/Test;",
			functionAddress: "4096",
			name: "nativeInit",
			signature: "()V"
		}),
		Object.freeze({
			classDescriptor: "Lexample/Test;",
			functionAddress: "8192",
			name: "nativeOther",
			signature: "(I)J"
		})
	]);
});

test("conflicting native batch fails before partial mutation", () => {
	const registry = createJniNativeMethodRegistry();
	registry.registerBatch("Lexample/Test;", createRecords());
	assert.throws(
		() => registry.registerBatch("Lexample/Test;", [
			Object.freeze({
				functionAddress: 0x3000n,
				name: "newMethod",
				signature: "()V"
			}),
			Object.freeze({
				functionAddress: 0x9999n,
				name: "nativeInit",
				signature: "()V"
			})
		]),
		/JNI_NATIVE_METHOD_CONFLICT/
	);
	assert.equal(
		registry.lookup("Lexample/Test;", "newMethod", "()V"),
		null
	);
	assert.equal(registry.snapshot().length, 2);
});

function createRecords() {
	return Object.freeze([
		Object.freeze({
			functionAddress: 0x1000n,
			name: "nativeInit",
			signature: "()V"
		}),
		Object.freeze({
			functionAddress: 0x2000n,
			name: "nativeOther",
			signature: "(I)J"
		})
	]);
}
