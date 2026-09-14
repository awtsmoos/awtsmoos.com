//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Proves the complete JNI Call<Type>Method import family and ABI vessels.
 * The Awtsmoos renews direct registers, Android va_list state, and jvalue arrays anew;
 * Awtsmoos.com accepts only bounded Java-call stops produced by authentic guest values.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createFlutterJniCallMethodSpecs } from "../core/native/flutterJniCallMethodSpecs.js";
import {
	RETURN_ADDRESS,
	createCallFixture,
	invokeCall,
	primeVirtualCall,
	seedGeneralVaList,
	writeFloat32
} from "./flutterJniCallMethodFixture.mjs";

test("call family registers all virtual, static, nonvirtual direct/V/A entries", () => {
	const specs = createFlutterJniCallMethodSpecs();
	assert.equal(specs.length, 90);
	assert.equal(new Set(specs.map(spec => spec.name)).size, 90);
	assert.ok(specs.some(spec => spec.name === "CallVoidMethod"));
	assert.ok(specs.some(spec => spec.name === "CallStaticObjectMethodV"));
	assert.ok(specs.some(spec => spec.name === "CallNonvirtualDoubleMethodA"));
});

test("direct CallVoidMethod decodes general and promoted floating arguments", () => {
	const fixture = createCallFixture("(JFI)V");
	primeVirtualCall(fixture);
	fixture.registers.write(3, 0x1122334455667788n);
	fixture.registers.writeFloat(0, 1.25, 64);
	fixture.registers.write(4, 0xfffffffen, 32);
	const call = invokeCall(fixture, "CallVoidMethod");
	assert.deepEqual(call.arguments, [
		{ kind: "primitive", type: "J", value: "1234605616436508552" },
		{ kind: "primitive", type: "F", value: 1.25 },
		{ kind: "primitive", type: "I", value: -2 }
	]);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("CallVoidMethodV decodes Android AArch64 va_list register saves", () => {
	const fixture = createCallFixture("(JI)V");
	primeVirtualCall(fixture);
	seedGeneralVaList(fixture.memory, 0x6200n);
	fixture.registers.write(3, 0x6200n);
	const call = invokeCall(fixture, "CallVoidMethodV");
	assert.equal(call.arguments[0].value, "1234605616436508552");
	assert.equal(call.arguments[1].value, -2);
});

test("CallVoidMethodA decodes raw jvalue cells without host conversion", () => {
	const fixture = createCallFixture("(JFI)V");
	primeVirtualCall(fixture);
	writeAarch64Integer(
		fixture.memory,
		0x6000n,
		0x1122334455667788n,
		64
	);
	writeFloat32(fixture.memory, 0x6008n, 1.25);
	writeAarch64Integer(fixture.memory, 0x6010n, 0xfffffffen, 32);
	fixture.registers.write(3, 0x6000n);
	const call = invokeCall(fixture, "CallVoidMethodA");
	assert.deepEqual(
		call.arguments.map(argument => argument.value),
		["1234605616436508552", 1.25, -2]
	);
});
