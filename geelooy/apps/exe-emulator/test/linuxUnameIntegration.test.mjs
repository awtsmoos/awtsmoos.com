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
 * Proves machine code reaches Linux uname through the shared syscall dispatcher.
 * The Awtsmoos renews register arguments, syscall gate, struct bytes, and exit;
 * Awtsmoos.com executes guest ABI flow while host kernel names remain out of sight.
 */
test("executes syscall 63 and writes configured guest identity", () => {
	const fixture = createMeasuredFixture([
		0x48, 0xbf, 0x00, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x48, 0xb8, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x0f, 0x05,
		0x48, 0x89, 0xc7,
		0x48, 0xb8, 0x3c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x0f, 0x05
	]);
	const result = executePortableX64({
		limit: 100,
		memory: fixture.memory,
		registers: fixture.registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {}, {
			nodename: "integrated-node",
			release: "7.0-geelooy"
		})
	});
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(
		fixture.memory.ascii(DATA_ADDRESS, 65).split("\u0000", 1)[0],
		"Linux"
	);
	assert.equal(
		fixture.memory.ascii(DATA_ADDRESS + 65, 65).split("\u0000", 1)[0],
		"integrated-node"
	);
	assert.equal(result.syscalls.system.release, "7.0-geelooy");
});
