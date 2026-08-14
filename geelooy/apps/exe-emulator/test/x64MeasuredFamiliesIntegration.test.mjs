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
 * Proves the shared decoder and operation dispatcher execute all three new roads.
 * The Awtsmoos renews multiply, TEST flags, repeated stores, and Linux departure;
 * Awtsmoos.com measures integrated guest code rather than isolated helper art.
 */
test("dispatches immediate IMUL inside a complete guest program", () => {
	const fixture = createMeasuredFixture([
		0x48, 0x6b, 0xc1, 0x03,
		0x48, 0x89, 0xc7,
		0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00,
		0x0f, 0x05
	]);
	fixture.registers.setBigInt("rcx", 7n);
	const result = run(fixture);
	assert.equal(result.syscalls.exitCode, 21);
});

test("dispatches wide TEST without later flag mutation", () => {
	const fixture = createMeasuredFixture([
		0x85, 0xc9,
		0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00,
		0x48, 0xc7, 0xc7, 0x00, 0x00, 0x00, 0x00,
		0x0f, 0x05
	]);
	fixture.registers.setBigInt("rcx", 0n);
	const result = run(fixture);
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(result.registers.flags.zero, true);
	assert.equal(result.registers.flags.carry, false);
	assert.equal(result.registers.flags.overflow, false);
});

test("dispatches REP STOSB and writes guest memory", () => {
	const fixture = createMeasuredFixture([
		0xf3, 0xaa,
		0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00,
		0x48, 0xc7, 0xc7, 0x00, 0x00, 0x00, 0x00,
		0x0f, 0x05
	]);
	fixture.registers.setBigInt("rax", 0x5an);
	fixture.registers.setBigInt("rcx", 2n);
	fixture.registers.setBigInt("rdi", BigInt(DATA_ADDRESS));
	const result = run(fixture);
	assert.equal(result.syscalls.exitCode, 0);
	assert.deepEqual(
		Array.from(fixture.memory.bytes(DATA_ADDRESS, 2)),
		[0x5a, 0x5a]
	);
});

function run(fixture) {
	return executePortableX64({
		limit: 100,
		memory: fixture.memory,
		registers: fixture.registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
}
