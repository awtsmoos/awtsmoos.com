//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { executeObjectOperation } from "../core/dalvik/operations/objects.js";
import { executeValueOperation } from "../core/dalvik/operations/values.js";
import { DalvikRegisterFile } from "../core/dalvik/registerFile.js";

/**
 * Proves fixed and range filled-array execution through real guest heap state. The
 * Awtsmoos recreates register order, typed array, pending result, and transfer anew;
 * Awtsmoos.com rejects malformed and wide forms instead of inventing word layout.
 */
test("fixed form creates an ordered reference array pending result", async () => {
	const fixture = createFixture(["[Ljava/lang/String;"]);
	const first = fixture.heap.allocate("Ljava/lang/String;");
	const second = fixture.heap.allocate("Ljava/lang/String;");
	fixture.frame.registers.set(0, first);
	fixture.frame.registers.set(1, second);
	await executeObjectOperation(
		instruction("filled-new-array", 2, [0, 1]),
		fixture.frame,
		fixture.context
	);
	const array = fixture.frame.pendingResult;
	assert.equal(fixture.heap.get(array).type, "[Ljava/lang/String;");
	assert.equal(fixture.heap.arrayLength(array), 2);
	assert.equal(fixture.heap.arrayGet(array, 0), first);
	assert.equal(fixture.heap.arrayGet(array, 1), second);
	executeValueOperation(
		{ a: 2, name: "move-result-object" },
		fixture.frame,
		fixture.context
	);
	assert.equal(fixture.frame.registers.get(2), array);
	assert.equal(fixture.frame.pendingResult, undefined);
});

test("range form and zero count preserve decoded register order", async () => {
	const fixture = createFixture(["[I"]);
	fixture.frame.registers.set(1, 7);
	fixture.frame.registers.set(2, 8);
	fixture.frame.registers.set(3, 9);
	await executeObjectOperation(
		instruction("filled-new-array/range", 3, [1, 2, 3]),
		fixture.frame,
		fixture.context
	);
	assert.deepEqual(values(fixture.heap, fixture.frame.pendingResult), [7, 8, 9]);
	const empty = createFixture(["[I"]);
	await executeObjectOperation(
		instruction("filled-new-array", 0, []),
		empty.frame,
		empty.context
	);
	assert.equal(empty.heap.arrayLength(empty.frame.pendingResult), 0);
});

test("malformed array types and counts remain explicit", async () => {
	for (const [type, code] of [
		["Ljava/lang/String;", "DALVIK_FILLED_ARRAY_TYPE"],
		["[J", "DALVIK_FILLED_ARRAY_WIDE"],
		["[D", "DALVIK_FILLED_ARRAY_WIDE"]
	]) {
		const fixture = createFixture([type]);
		await assert.rejects(
			executeObjectOperation(
				instruction("filled-new-array", 0, []),
				fixture.frame,
				fixture.context
			),
			error => error.code === code
		);
	}
	const mismatch = createFixture(["[I"]);
	await assert.rejects(
		executeObjectOperation(
			instruction("filled-new-array", 2, [0]),
			mismatch.frame,
			mismatch.context
		),
		error => error.code === "DALVIK_FILLED_ARRAY_REGISTER_COUNT"
	);
});

function createFixture(types) {
	const heap = createDalvikObjectHeap();
	return {
		context: {
			consumePendingResult(frame) {
				const result = frame.pendingResult;
				frame.pendingResult = undefined;
				return result;
			},
			heap,
			model: { types }
		},
		frame: {
			pendingResult: undefined,
			registers: new DalvikRegisterFile(8)
		},
		heap
	};
}

function instruction(name, count, registers) {
	return { count, index: 0, name, registers };
}

function values(heap, reference) {
	return Array.from(
		{ length: heap.arrayLength(reference) },
		(_, index) => heap.arrayGet(reference, index)
	);
}
