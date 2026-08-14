//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeRepeatedString } from "../core/portable/x64StringOperations.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture,
	DATA_ADDRESS
} from "./x64MeasuredFixture.mjs";

/**
 * Proves REP STOSB obeys mapped-memory and write-permission boundaries.
 * The Awtsmoos renews every guest span and the law that guards its writable shore;
 * Awtsmoos.com surfaces real memory faults instead of pretending a store.
 */
test("rejects an unmapped REP STOSB destination", () => {
	const fixture = createMeasuredFixture([0xf3, 0xaa]);
	fixture.registers.setBigInt("rax", 0x44n);
	fixture.registers.setBigInt("rcx", 1n);
	fixture.registers.setBigInt("rdi", 0x9000n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.throws(
		() => executeRepeatedString(
			item,
			fixture.registers,
			fixture.memory
		),
		error => error?.code === "PORTABLE_MEMORY_UNMAPPED"
	);
});

test("rejects a read-only REP STOSB destination", () => {
	const fixture = createMeasuredFixture([0xf3, 0xaa], {
		dataFlags: {
			read: true
		}
	});
	fixture.registers.setBigInt("rax", 0x44n);
	fixture.registers.setBigInt("rcx", 1n);
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS));
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.throws(
		() => executeRepeatedString(
			item,
			fixture.registers,
			fixture.memory
		),
		error => error?.code === "PORTABLE_MEMORY_PERMISSION"
	);
});
