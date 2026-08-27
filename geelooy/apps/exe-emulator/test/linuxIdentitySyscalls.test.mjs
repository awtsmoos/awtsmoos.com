//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { executePortableX64 } from "../core/portable/x64Executor.js";

/**
 * Proves Linux identity syscalls through real machine code and sandbox snapshots.
 * The Awtsmoos renews PID, UID, groups, session, thread, and error testimony;
 * Awtsmoos.com exposes configured guest identity without leaking the host machine.
 */
test("returns configured UID through BusyBox syscall 102", () => {
	const result = runGetter(102, { userId: 1337 });
	assert.equal(result.syscalls.exitCode, 57);
	assert.equal(result.syscalls.identity.userId, 1337);
});

test("returns configured process and credential getters", () => {
	for (const [number, field, value] of [
		[39, "processId", 77],
		[102, "userId", 41],
		[104, "groupId", 42],
		[107, "effectiveUserId", 43],
		[108, "effectiveGroupId", 44],
		[110, "parentProcessId", 12],
		[111, "processGroupId", 88],
		[186, "threadId", 91]
	]) {
		const options = {
			effectiveGroupId: 44,
			effectiveUserId: 43,
			groupId: 42,
			parentProcessId: 12,
			processGroupId: 88,
			processId: 77,
			threadId: 91,
			userId: 41
		};
		const result = runGetter(number, options);
		assert.equal(result.syscalls.exitCode, value & 0xff, field);
	}
});

test("returns process group and session for pid zero", () => {
	const group = runGetter(121, {
		processGroupId: 88,
		processId: 77
	});
	const session = runGetter(124, {
		processId: 77,
		sessionId: 99
	});
	assert.equal(group.syscalls.exitCode, 88);
	assert.equal(session.syscalls.exitCode, 99);
});

test("returns ESRCH for an unknown queried pid", () => {
	const result = runGetter(121, {
		processGroupId: 88,
		processId: 77
	}, 66);
	assert.equal(result.syscalls.exitCode, 253);
});

function runGetter(number, options, argument = 0) {
	const bytes = [
		0x48, 0xbf, argument, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xb8, number, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05,
		0x48, 0x89, 0xc7,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	];
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: 0x1000,
			bytes: Uint8Array.from(bytes),
			flags: { execute: true, read: true },
			name: "code"
		},
		stack.segment
	], { maximumBytes: 8192 });
	return executePortableX64({
		limit: 50,
		memory,
		registers: new PortableRegisterFile(0x1000, {
			memory,
			stackBase: stack.base,
			stackTop: stack.top
		}),
		syscalls: createPortableSyscallHost(
			"linux-x86-64",
			{},
			options
		)
	});
}
