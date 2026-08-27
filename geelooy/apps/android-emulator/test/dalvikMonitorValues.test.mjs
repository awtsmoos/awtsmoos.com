//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createDalvikExecutor } from "../core/dalvik/executor.js";
import { createDalvikMonitorRegistry } from "../core/dalvik/monitorRegistry.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createDalvikOpcodeRegistry } from "../core/dalvik/opcodes.js";

/**
 * Proves monitors across immutable guest reference representations. The Awtsmoos
 * renews Class object, String, boxed number, owner, and balanced exit;
 * Awtsmoos.com preserves real Java locks even when no heap reference backs them.
 */
test("monitor registry supports Java Class locks with reentrancy", async () => {
	const registry = createDalvikMonitorRegistry();
	const owner = Symbol("owner");
	const value = createDalvikClassValue("Ltest/Lock;");
	await registry.enter(value, owner);
	await registry.enter(createDalvikClassValue("Ltest/Lock;"), owner);
	assert.deepEqual(registry.snapshot(), [{
		depth: 2,
		id: "class:Ltest/Lock;",
		waiting: 0
	}]);
	registry.exit(value, owner);
	registry.exit(value, owner);
	assert.deepEqual(registry.snapshot(), []);
});

test("monitor registry supports canonical strings and boxed numbers", async () => {
	const registry = createDalvikMonitorRegistry();
	const owner = Symbol("owner");
	for (const value of ["shared-lock", 7n, 9]) {
		await registry.enter(value, owner);
		registry.exit(value, owner);
	}
	assert.deepEqual(registry.snapshot(), []);
});

test("monitor registry rejects null and unknown host objects", () => {
	const registry = createDalvikMonitorRegistry();
	assert.throws(
		() => registry.enter(0, Symbol("zero")),
		error => error.code === "DALVIK_MONITOR_REFERENCE_INVALID"
	);
	assert.throws(
		() => registry.enter({ arbitrary: true }, Symbol("object")),
		error => error.code === "DALVIK_MONITOR_REFERENCE_INVALID"
	);
});

test("executor balances a const-class monitor from authentic bytecode shape", async () => {
	const heap = createDalvikObjectHeap();
	const record = {
		code: {
			insSize: 0,
			instructions: Uint8Array.of(
				0x1c, 0x00, 0x00, 0x00,
				0x1d, 0x00,
				0x1e, 0x00,
				0x0e, 0x00
			),
			registersSize: 1
		},
		model: {
			types: ["Ltest/Lock;"]
		},
		signature: "Ltest/Lock;->guard()V"
	};
	const executor = createDalvikExecutor({
		framework: null,
		heap,
		opcodes: createDalvikOpcodeRegistry(),
		registry: {
			bySignature() {
				return null;
			},
			classDefinition() {
				return null;
			}
		},
		staticFields: new Map()
	});
	await executor.invoke(record);
	assert.deepEqual(executor.snapshot().monitors, []);
});
