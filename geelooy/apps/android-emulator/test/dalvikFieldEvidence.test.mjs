//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { executeFieldOperation } from "../core/dalvik/operations/fields.js";
import { DalvikRegisterFile } from "../core/dalvik/registerFile.js";

/**
 * Proves asynchronous field execution and deterministic failure evidence. The
 * Awtsmoos renews owner, value, register, declaration, and class awakening;
 * Awtsmoos.com preserves the exact guest road when bounded heap truth rejects it.
 */
test("instance field operations store and retrieve guest references", async () => {
	const fixture = createFieldFixture();
	const owner = fixture.heap.allocate("Ltest/Owner;");
	const value = fixture.heap.allocate("Ltest/Value;");
	fixture.registers.set(0, value);
	fixture.registers.set(1, owner);
	await executeFieldOperation(
		fieldInstruction("iput-object", 0, 1, 12),
		fixture.frame,
		fixture.context
	);
	await executeFieldOperation(
		fieldInstruction("iget-object", 2, 1, 16),
		fixture.frame,
		fixture.context
	);
	assert.equal(fixture.registers.get(2), value);
	assert.deepEqual(fixture.initializedClasses, []);
});

test("null field owners retain complete instruction evidence", async () => {
	const fixture = createFieldFixture();
	fixture.registers.set(0, fixture.heap.allocate("Ltest/Value;"));
	fixture.registers.set(1, 0);
	await assert.rejects(
		executeFieldOperation(
			fieldInstruction("iput-object", 0, 1, 42),
			fixture.frame,
			fixture.context
		),
		error => {
			assert.equal(error.code, "DALVIK_REFERENCE_INVALID");
			assert.equal(error.pc, 42);
			assert.equal(error.signature, "Ltest/Owner;->write()V");
			assert.deepEqual(error.dalvikField, {
				fieldIndex: 0,
				fieldSignature: "Ltest/Owner;->value:Ltest/Value;",
				instructionName: "iput-object",
				methodSignature: "Ltest/Owner;->write()V",
				owner: {
					kind: "number",
					value: 0
				},
				ownerRegister: 1,
				pc: 42,
				value: {
					id: 1,
					kind: "dalvik-reference",
					type: "Ltest/Value;"
				},
				valueRegister: 0
			});
			return true;
		}
	);
});

function createFieldFixture() {
	const heap = createDalvikObjectHeap();
	const registers = new DalvikRegisterFile(3);
	const initializedClasses = [];
	return Object.freeze({
		context: Object.freeze({
			currentRecord: {
				signature: "Ltest/Owner;->write()V"
			},
			ensureClassInitialized(classType) {
				initializedClasses.push(classType);
			},
			heap,
			model: {
				fields: [{
					classType: "Ltest/Owner;",
					name: "value",
					type: "Ltest/Value;"
				}]
			},
			staticFields: new Map()
		}),
		frame: { registers },
		heap,
		initializedClasses,
		registers
	});
}

function fieldInstruction(name, a, b, pc) {
	return Object.freeze({
		a,
		b,
		index: 0,
		name,
		pc
	});
}
