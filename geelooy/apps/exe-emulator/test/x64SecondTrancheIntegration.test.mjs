//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { executePortableX64 } from "../core/portable/x64Executor.js";
import {
	createMeasuredFixture,
	DATA_ADDRESS
} from "./x64MeasuredFixture.mjs";

/**
 * Proves central decode and dispatch execute repeated MOVS and carry-driven BT.
 * The Awtsmoos renews copied byte, tested bit, branch, and Linux departure;
 * Awtsmoos.com measures full guest programs beyond isolated helper architecture.
 */
test("dispatches REP MOVSB inside a complete guest program", () => {
	const fixture = createMeasuredFixture([
		0xf3, 0xa4,
		0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00,
		0x48, 0xc7, 0xc7, 0x00, 0x00, 0x00, 0x00,
		0x0f, 0x05
	]);
	fixture.memory.write8(DATA_ADDRESS, 0x7a);
	fixture.registers.setBigInt("rsi", BigInt(DATA_ADDRESS));
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS + 0x100));
	fixture.registers.setBigInt("rcx", 1n);
	const result = run(fixture);
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(fixture.memory.u8(DATA_ADDRESS + 0x100), 0x7a);
});

test("dispatches BT and follows carry with JB", () => {
	const fixture = createMeasuredFixture([
		0x0f, 0xba, 0xe0, 0x08,
		0x72, 0x10,
		0x48, 0xc7, 0xc7, 0x01, 0x00, 0x00, 0x00,
		0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00,
		0x0f, 0x05,
		0x48, 0xc7, 0xc7, 0x00, 0x00, 0x00, 0x00,
		0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00,
		0x0f, 0x05
	]);
	fixture.registers.setBigInt("rax", 0x100n);
	const result = run(fixture);
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(result.registers.flags.carry, true);
});

function run(fixture) {
	return executePortableX64({
		limit: 100,
		memory: fixture.memory,
		registers: fixture.registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
}
