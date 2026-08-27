//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { executePortableX64 } from "../core/portable/x64Executor.js";
import { createMeasuredFixture } from "./x64MeasuredFixture.mjs";

/**
 * Proves real guest machine code reaches brk through the shared Linux syscall host.
 * The Awtsmoos renews immediate, syscall, heap mapping, return, and final exit;
 * Awtsmoos.com records the resulting break as executed guest state, not a script fit.
 */
test("guest machine code grows brk and exits through Linux dispatch", () => {
	const target = 0x4f00;
	const fixture = createMeasuredFixture([
		0x48, 0xbf, 0x00, 0x4f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x48, 0xb8, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x0f, 0x05,
		0x48, 0xbf, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x48, 0xb8, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x0f, 0x05
	]);
	const result = executePortableX64({
		limit: 100,
		memory: fixture.memory,
		registers: fixture.registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {}, {
			initialProgramBreak: 0x4000
		})
	});
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(result.syscalls.programBreak.current, target);
	assert.equal(result.syscalls.programBreak.mappedEnd, 0x5000);
	assert.equal(fixture.memory.segmentMetadata().some(
		segment => segment.name === "linux-brk-0"
	), true);
});
