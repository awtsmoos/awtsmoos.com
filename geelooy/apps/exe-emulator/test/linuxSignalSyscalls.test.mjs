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
const SET = BASE;
const OLD = BASE + 0x40;
const ACTION = BASE + 0x80;

/**
 * Proves Linux signal masks and dispositions remain exact guest-owned state.
 * The Awtsmoos renews mask, action, old record, errno, and snapshot together;
 * Awtsmoos.com changes no host signal while real applets configure their process.
 */
test("blocks a guest mask while keeping SIGKILL and SIGSTOP unblocked", () => {
	const runtime = fixture();
	runtime.memory.write64BigInt(
		SET,
		(1n << 1n) | (1n << 8n) | (1n << 18n)
	);
	invoke(runtime, 14, 0, SET, OLD, 8);
	assert.equal(runtime.registers.get("rax"), 0);
	assert.equal(runtime.memory.u64BigInt(OLD), 0n);
	assert.equal(runtime.host.snapshot().signals.mask, "0x2");
});

test("unblocks and replaces exact signal masks", () => {
	const runtime = fixture({ signalMask: 0xfn });
	runtime.memory.write64BigInt(SET, 0x3n);
	invoke(runtime, 14, 1, SET, OLD, 8);
	assert.equal(runtime.host.snapshot().signals.mask, "0xc");
	runtime.memory.write64BigInt(SET, 0x20n);
	invoke(runtime, 14, 2, SET, OLD, 8);
	assert.equal(runtime.host.snapshot().signals.mask, "0x20");
});

test("round-trips a Linux x86-64 signal action", () => {
	const runtime = fixture();
	for (const [offset, value] of [
		[0, 0x401000n],
		[8, 0x04000000n],
		[16, 0x402000n],
		[24, 0x55n]
	]) {
		runtime.memory.write64BigInt(ACTION + offset, value);
	}
	invoke(runtime, 13, 2, ACTION, 0, 8);
	invoke(runtime, 13, 2, 0, OLD, 8);
	assert.equal(runtime.memory.u64BigInt(OLD), 0x401000n);
	assert.equal(runtime.memory.u64BigInt(OLD + 8), 0x04000000n);
	assert.equal(runtime.memory.u64BigInt(OLD + 16), 0x402000n);
	assert.equal(runtime.memory.u64BigInt(OLD + 24), 0x55n);
	assert.equal(runtime.host.snapshot().signals.actions[0].signal, 2);
});

test("returns exact EINVAL and EFAULT boundaries", () => {
	const runtime = fixture();
	invoke(runtime, 14, 0, SET, 0, 16);
	assert.equal(runtime.registers.getBigInt("rax"), -22n);
	invoke(runtime, 14, 0, 0x900000, 0, 8);
	assert.equal(runtime.registers.getBigInt("rax"), -14n);
	invoke(runtime, 13, 9, ACTION, 0, 8);
	assert.equal(runtime.registers.getBigInt("rax"), -22n);
});

function fixture(options = {}) {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: BASE,
			bytes: new Uint8Array(1024),
			flags: { read: true, write: true },
			name: "signal-memory"
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

function invoke(runtime, number, first, second, third, size) {
	runtime.registers.set("rax", number);
	runtime.registers.set("rdi", first);
	runtime.registers.set("rsi", second);
	runtime.registers.set("rdx", third);
	runtime.registers.set("r10", size);
	return runtime.host.handle(runtime.registers, runtime.memory);
}
