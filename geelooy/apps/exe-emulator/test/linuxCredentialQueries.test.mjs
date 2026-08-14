//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";

const BASE = 0x2000;

/**
 * Proves Linux resolved IDs and supplementary groups through exact guest memory.
 * The Awtsmoos renews three-ID readback, group list, privilege, errno, and trace;
 * Awtsmoos.com validates libc credential state without host group inspection.
 */
test("writes real, effective, and saved user IDs", () => {
	const runtime = fixture({
		effectiveUserId: 22,
		savedUserId: 33,
		userId: 11
	});
	invoke(runtime, 118, BASE, BASE + 4, BASE + 8);
	assert.equal(runtime.memory.u32(BASE), 11);
	assert.equal(runtime.memory.u32(BASE + 4), 22);
	assert.equal(runtime.memory.u32(BASE + 8), 33);
});

test("sets and reads supplementary groups as root", () => {
	const runtime = fixture({ effectiveUserId: 0, userId: 0 });
	runtime.memory.write32(BASE, 41);
	runtime.memory.write32(BASE + 4, 42);
	invoke(runtime, 116, 2, BASE);
	assert.equal(runtime.registers.get("rax"), 0);
	invoke(runtime, 115, 0, 0);
	assert.equal(runtime.registers.get("rax"), 2);
	invoke(runtime, 115, 2, BASE + 16);
	assert.equal(runtime.memory.u32(BASE + 16), 41);
	assert.equal(runtime.memory.u32(BASE + 20), 42);
});

test("rejects unprivileged setgroups", () => {
	const runtime = fixture();
	runtime.memory.write32(BASE, 77);
	invoke(runtime, 116, 1, BASE);
	assert.equal(runtime.registers.getBigInt("rax"), -1n);
	assert.deepEqual(runtime.host.snapshot().identity.supplementaryGroups, []);
});

test("returns EINVAL when the group output buffer is too small", () => {
	const runtime = fixture({ supplementaryGroups: [1, 2, 3] });
	invoke(runtime, 115, 2, BASE);
	assert.equal(runtime.registers.getBigInt("rax"), -22n);
});

function fixture(options = {}) {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: BASE,
			bytes: new Uint8Array(1024),
			flags: { read: true, write: true },
			name: "credential-memory"
		},
		stack.segment
	], { maximumBytes: 16384 });
	return {
		host: createPortableSyscallHost("linux-x86-64", {}, options),
		memory,
		registers: new PortableRegisterFile(0x1000, {
			memory,
			stackBase: stack.base,
			stackTop: stack.top
		})
	};
}

function invoke(runtime, number, first = 0, second = 0, third = 0) {
	runtime.registers.set("rax", number);
	runtime.registers.set("rdi", first);
	runtime.registers.set("rsi", second);
	runtime.registers.set("rdx", third);
	return runtime.host.handle(runtime.registers, runtime.memory);
}
