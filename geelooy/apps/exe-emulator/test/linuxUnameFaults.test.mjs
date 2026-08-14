//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";

const BUFFER = 0x2000;

/**
 * Proves Linux uname returns EFAULT for every invalid guest destination boundary.
 * The Awtsmoos renews null, missing, short, and read-only vessels under kernel law;
 * Awtsmoos.com reports guest errno without leaking an uncaught memory flaw.
 */
for (const current of [
	{
		name: "null pointer",
		pointer: 0,
		size: 390,
		flags: { read: true, write: true }
	},
	{
		name: "unmapped pointer",
		pointer: 0x9000,
		size: 390,
		flags: { read: true, write: true }
	},
	{
		name: "short destination",
		pointer: BUFFER,
		size: 389,
		flags: { read: true, write: true }
	},
	{
		name: "read-only destination",
		pointer: BUFFER,
		size: 390,
		flags: { read: true }
	}
]) {
	test(`returns EFAULT for ${current.name}`, () => {
		const runtime = fixture(current.size, current.flags);
		runtime.registers.set("rax", 63);
		runtime.registers.set("rdi", current.pointer);
		const result = runtime.host.handle(
			runtime.registers,
			runtime.memory
		);
		assert.equal(runtime.registers.getBigInt("rax"), -14n);
		assert.equal(result.error, "EFAULT");
		assert.equal(result.result, -14);
	});
}

test("rejects oversized and NUL-containing configured fields", () => {
	assert.throws(
		() => createPortableSyscallHost("linux-x86-64", {}, {
			nodename: "a".repeat(65)
		}),
		error => error?.code === "LINUX_UTSNAME_FIELD"
	);
	assert.throws(
		() => createPortableSyscallHost("linux-x86-64", {}, {
			nodename: "bad\u0000node"
		}),
		error => error?.code === "LINUX_UTSNAME_FIELD"
	);
});

function fixture(size, flags) {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: BUFFER,
			bytes: new Uint8Array(size),
			flags,
			name: "utsname-target"
		},
		stack.segment
	], { maximumBytes: 8192 });
	return {
		host: createPortableSyscallHost("linux-x86-64", {}),
		memory,
		registers: new PortableRegisterFile(0x1000, {
			memory,
			stackBase: stack.base,
			stackTop: stack.top
		})
	};
}
