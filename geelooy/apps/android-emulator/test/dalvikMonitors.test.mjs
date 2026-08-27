//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeDalvikInstruction } from "../core/dalvik/decoder.js";
import { createDalvikExecutor } from "../core/dalvik/executor.js";
import { createDalvikMonitorRegistry } from "../core/dalvik/monitorRegistry.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createDalvikOpcodeRegistry } from "../core/dalvik/opcodes.js";

/**
 * Proves decoded and executed Java object monitors. The Awtsmoos renews guarded
 * reference, owner, waiting road, and release; Awtsmoos.com records synchronization
 * evidence rather than treating monitor bytecode as decorative no-ops.
 */
test("Dalvik decodes monitor-enter and monitor-exit as 11x", () => {
	const enter = decodeDalvikInstruction(Uint8Array.of(0x1d, 0x03), 0);
	const exit = decodeDalvikInstruction(Uint8Array.of(0x1e, 0x07), 0);
	assert.deepEqual(
		{ a: enter.a, format: enter.format, name: enter.name, size: enter.size },
		{ a: 3, format: "11x", name: "monitor-enter", size: 2 }
	);
	assert.deepEqual(
		{ a: exit.a, format: exit.format, name: exit.name, size: exit.size },
		{ a: 7, format: "11x", name: "monitor-exit", size: 2 }
	);
});

test("monitor registry is reentrant and grants FIFO waiters", async () => {
	const heap = createDalvikObjectHeap();
	const reference = heap.allocate("Ljava/lang/Object;");
	const registry = createDalvikMonitorRegistry();
	const firstOwner = Symbol("first");
	const secondOwner = Symbol("second");
	await registry.enter(reference, firstOwner);
	await registry.enter(reference, firstOwner);
	let secondEntered = false;
	const pending = registry.enter(reference, secondOwner).then(() => {
		secondEntered = true;
	});
	await Promise.resolve();
	assert.equal(secondEntered, false);
	assert.deepEqual(registry.snapshot(), [{ depth: 2, id: reference.id, waiting: 1 }]);
	registry.exit(reference, firstOwner);
	assert.equal(secondEntered, false);
	registry.exit(reference, firstOwner);
	await pending;
	assert.equal(secondEntered, true);
	assert.deepEqual(registry.snapshot(), [{ depth: 1, id: reference.id, waiting: 0 }]);
	registry.exit(reference, secondOwner);
	assert.deepEqual(registry.snapshot(), []);
});

test("executor completes balanced reentrant monitor bytecode", async () => {
	const fixture = createExecutorFixture(Uint8Array.of(
		0x1d, 0x00,
		0x1d, 0x00,
		0x1e, 0x00,
		0x1e, 0x00,
		0x0e, 0x00
	));
	await fixture.executor.invoke(fixture.record, [fixture.reference]);
	assert.deepEqual(fixture.executor.snapshot().monitors, []);
});

test("executor rejects monitor-exit without ownership", async () => {
	const fixture = createExecutorFixture(Uint8Array.of(
		0x1e, 0x00,
		0x0e, 0x00
	));
	await assert.rejects(
		fixture.executor.invoke(fixture.record, [fixture.reference]),
		error => error.code === "DALVIK_MONITOR_EXIT_UNOWNED"
	);
});

function createExecutorFixture(instructions) {
	const heap = createDalvikObjectHeap();
	const reference = heap.allocate("Ljava/lang/Object;");
	const record = {
		code: {
			insSize: 1,
			instructions,
			registersSize: 1
		},
		model: {},
		signature: "Ltest/Monitor;->run(Ljava/lang/Object;)V"
	};
	const executor = createDalvikExecutor({
		framework: null,
		heap,
		opcodes: createDalvikOpcodeRegistry(),
		registry: {},
		staticFields: new Map()
	});
	return Object.freeze({ executor, record, reference });
}
