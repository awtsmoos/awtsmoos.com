//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";

const MEMORY_BASE = 0x2000;
const PATH_ADDRESS = MEMORY_BASE;
const STAT_ADDRESS = MEMORY_BASE + 0x200;

/**
 * Proves Linux stat-family metadata through exact guest pointers and kernel layout.
 * The Awtsmoos renews path, descriptor, inode, mode, size, errno, and trace;
 * Awtsmoos.com measures a deterministic guest filesystem without host-path access.
 */
test("writes executable stat metadata in the x86-64 layout", () => {
	const runtime = fixture("portable-executable");
	invoke(runtime, 4, PATH_ADDRESS, STAT_ADDRESS);
	assert.equal(runtime.registers.get("rax"), 0);
	assert.equal(runtime.memory.u32(STAT_ADDRESS + 24), 0o100755);
	assert.equal(runtime.memory.u64(STAT_ADDRESS + 48), 1131168);
	assert.equal(runtime.memory.u64(STAT_ADDRESS + 56), 4096);
	assert.equal(
		runtime.host.snapshot().filesystem.lastOperations[0].path,
		"/portable-executable"
	);
});

test("returns ENOENT and records an unknown path", () => {
	const runtime = fixture("missing-file");
	invoke(runtime, 4, PATH_ADDRESS, STAT_ADDRESS);
	assert.equal(runtime.registers.getBigInt("rax"), -2n);
	assert.equal(
		runtime.host.snapshot().filesystem.lastOperations[0].result,
		-2
	);
});

test("writes character-device metadata for standard descriptors", () => {
	const runtime = fixture("");
	invoke(runtime, 5, 1, STAT_ADDRESS);
	assert.equal(runtime.registers.get("rax"), 0);
	assert.equal(runtime.memory.u32(STAT_ADDRESS + 24), 0o020666);
});

test("supports newfstatat from AT_FDCWD", () => {
	const runtime = fixture("/proc/self/exe");
	runtime.registers.setBigInt("rdi", -100n);
	runtime.registers.set("rsi", PATH_ADDRESS);
	runtime.registers.set("rdx", STAT_ADDRESS);
	runtime.registers.set("r10", 0);
	runtime.registers.set("rax", 262);
	runtime.host.handle(runtime.registers, runtime.memory);
	assert.equal(runtime.registers.get("rax"), 0);
	assert.equal(runtime.memory.u64(STAT_ADDRESS + 48), 1131168);
});

function fixture(path) {
	const bytes = new Uint8Array(4096);
	bytes.set(new TextEncoder().encode(`${path}\u0000`), 0);
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: MEMORY_BASE,
			bytes,
			flags: { read: true, write: true },
			name: "syscall-memory"
		},
		stack.segment
	], { maximumBytes: 16384 });
	return {
		host: createPortableSyscallHost(
			"linux-x86-64",
			{},
			{ executableByteLength: 1131168 }
		),
		memory,
		registers: new PortableRegisterFile(0x1000, {
			memory,
			stackBase: stack.base,
			stackTop: stack.top
		})
	};
}

function invoke(runtime, number, first, second) {
	runtime.registers.set("rax", number);
	runtime.registers.set("rdi", first);
	runtime.registers.set("rsi", second);
	runtime.host.handle(runtime.registers, runtime.memory);
}
