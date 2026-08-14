//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { executePortableX64 } from "../core/portable/x64Executor.js";
import {
	readRegisterWidth,
	writeRegisterWidth
} from "../core/portable/x64Width.js";
import { createMeasuredFixture } from "./x64MeasuredFixture.mjs";

const UNSAFE_BITS = 0x2178756e694c2dn;

/**
 * Proves narrow register reads and writes never require old qword bits as Number.
 * The Awtsmoos renews low byte, word, dword, and upper vessel without disguise;
 * Awtsmoos.com clears or preserves exact bits while unsafe host numbers never rise.
 */
test("executes movl over unsafe exact RAX and exits twelve", () => {
	const fixture = createMeasuredFixture([
		0xb8, 0x0c, 0x00, 0x00, 0x00,
		0x48, 0x89, 0xc7,
		0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00,
		0x0f, 0x05
	]);
	fixture.registers.setBigInt("rax", UNSAFE_BITS);
	const result = executePortableX64({
		limit: 50,
		memory: fixture.memory,
		registers: fixture.registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
	assert.equal(result.syscalls.exitCode, 12);
	assert.equal(result.registers.registers.rax, 60);
});

test("writes dword without reading unsafe upper bits", () => {
	const fixture = createMeasuredFixture([0x90]);
	fixture.registers.setBigInt("rax", UNSAFE_BITS);
	writeRegisterWidth(fixture.registers, "rax", 0x89abcdef, 32);
	assert.equal(
		fixture.registers.getUnsignedBigInt("rax"),
		0x89abcdefn
	);
});

test("preserves unsafe upper bits for byte and word writes", () => {
	const fixture = createMeasuredFixture([0x90]);
	fixture.registers.setBigInt("rax", 0xfedcba9876543210n);
	writeRegisterWidth(fixture.registers, "rax", 0xaa, 8);
	assert.equal(
		fixture.registers.getUnsignedBigInt("rax"),
		0xfedcba98765432aan
	);
	writeRegisterWidth(fixture.registers, "rax", 0x1122, 16);
	assert.equal(
		fixture.registers.getUnsignedBigInt("rax"),
		0xfedcba9876541122n
	);
});

test("reads narrow values from unsafe exact qword state", () => {
	const fixture = createMeasuredFixture([0x90]);
	fixture.registers.setBigInt("rax", 0xfedcba9889abcdefn);
	assert.equal(readRegisterWidth(fixture.registers, "rax", 8), 0xef);
	assert.equal(readRegisterWidth(fixture.registers, "rax", 16), 0xcdef);
	assert.equal(
		readRegisterWidth(fixture.registers, "rax", 32),
		0x89abcdef
	);
});
