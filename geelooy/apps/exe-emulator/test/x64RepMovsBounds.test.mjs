//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeRepeatedMove } from "../core/portable/x64StringMoveOperations.js";
import { CODE_ADDRESS } from "./x64MeasuredFixture.mjs";

const SOURCE = 0x3000;
const DESTINATION = 0x4000;

/**
 * Proves REP MOVS respects independent source and destination permissions.
 * The Awtsmoos renews readable source and writable shore with measured law;
 * Awtsmoos.com reveals real mapping faults instead of hiding every flaw.
 */
test("copies from read-only source into writable destination", () => {
	const fixture = createSplitFixture(
		{ read: true },
		{ read: true, write: true }
	);
	prepareCopy(fixture);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	executeRepeatedMove(item, fixture.registers, fixture.memory);
	assert.equal(fixture.memory.u8(DESTINATION), 0x6d);
});

test("rejects a read-only destination", () => {
	const fixture = createSplitFixture(
		{ read: true },
		{ read: true }
	);
	prepareCopy(fixture);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.throws(
		() => executeRepeatedMove(item, fixture.registers, fixture.memory),
		error => error?.code === "PORTABLE_MEMORY_PERMISSION"
	);
});

test("rejects an unmapped source", () => {
	const fixture = createSplitFixture(
		{ read: true },
		{ read: true, write: true }
	);
	fixture.registers.setBigInt("rsi", 0x9000n);
	fixture.registers.setBigInt("rdi", BigInt(DESTINATION));
	fixture.registers.setBigInt("rcx", 1n);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.throws(
		() => executeRepeatedMove(item, fixture.registers, fixture.memory),
		error => error?.code === "PORTABLE_MEMORY_UNMAPPED"
	);
});

function prepareCopy(fixture) {
	fixture.registers.setBigInt("rsi", BigInt(SOURCE));
	fixture.registers.setBigInt("rdi", BigInt(DESTINATION));
	fixture.registers.setBigInt("rcx", 1n);
}

function createSplitFixture(sourceFlags, destinationFlags) {
	const memory = new PortableByteMemory([
		{
			address: CODE_ADDRESS,
			bytes: Uint8Array.from([0xf3, 0xa4]),
			flags: { execute: true, read: true }
		},
		{
			address: SOURCE,
			bytes: Uint8Array.from([0x6d]),
			flags: sourceFlags
		},
		{
			address: DESTINATION,
			bytes: new Uint8Array(1),
			flags: destinationFlags
		}
	]);
	const registers = new PortableRegisterFile(CODE_ADDRESS, {
		memory,
		stackBase: DESTINATION,
		stackTop: DESTINATION + 1
	});
	return { memory, registers };
}
