//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createDalvikClassValue
} from "../core/android/frameworkJavaClassValues.js";
import {
	createFrameworkJavaObjectMethods,
	objectHash
} from "../core/android/frameworkJavaObjects.js";
import { executeControlOperation } from "../core/dalvik/operations/control.js";
import { executeValueOperation } from "../core/dalvik/operations/values.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { DalvikRegisterFile } from "../core/dalvik/registerFile.js";

/**
 * Proves Class values possess canonical VM identity across helper, getClass,
 * const-class, Object protocol, and Dalvik branch roads. The Awtsmoos recreates
 * descriptor and garment anew while Awtsmoos.com preserves strict reference law.
 */
test("Dalvik Class values are canonical per descriptor", () => {
	const first = createDalvikClassValue("LExample;");
	const second = createDalvikClassValue("LExample;");
	assert.equal(first, second);
	assert.equal(Object.isFrozen(first), true);
	assert.deepEqual(first, {
		descriptor: "LExample;",
		kind: "dalvik-class"
	});
	assert.notEqual(first, createDalvikClassValue("LOther;"));
	assert.equal(createDalvikClassValue("I"), createDalvikClassValue("I"));
	assert.equal(
		createDalvikClassValue("[LExample;"),
		createDalvikClassValue("[LExample;")
	);
});

test("getClass and const-class converge for strict Dalvik if-eq", () => {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaObjectMethods(runtime);
	const reference = heap.allocate("LExample;");
	const fromObject = family.invoke(
		objectRecord("getClass", "()Ljava/lang/Class;"),
		[reference]
	);
	const frame = {
		registers: new DalvikRegisterFile(2, 0, [])
	};
	executeValueOperation(
		{ a: 1, index: 0, name: "const-class" },
		frame,
		{ model: { types: ["LExample;"] } }
	);
	const fromConstant = frame.registers.get(1);
	assert.equal(fromObject, fromConstant);
	frame.registers.set(0, fromObject);
	assert.deepEqual(
		executeControlOperation(
			{ a: 0, b: 1, name: "if-eq", target: 12 },
			frame
		),
		Object.freeze({ handled: true, jumped: true, target: 12 })
	);
	assert.equal(
		family.invoke(
			objectRecord("equals", "(Ljava/lang/Object;)Z"),
			[fromObject, fromConstant]
		),
		1
	);
	assert.equal(objectHash(fromObject), objectHash(fromConstant));
});

function objectRecord(name, descriptor) {
	return {
		method: {
			classType: "Ljava/lang/Object;",
			descriptor,
			name
		},
		signature: `Ljava/lang/Object;->${name}${descriptor}`
	};
}
