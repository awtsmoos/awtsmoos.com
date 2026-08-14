//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";

/**
 * Proves Linux credential mutation remains coherent inside one sandbox identity.
 * The Awtsmoos renews privilege, real, effective, saved, filesystem, and refusal;
 * Awtsmoos.com changes no host UID or GID while real libc wrappers execute.
 */
test("allows an unprivileged process to retain its real group", () => {
	const runtime = fixture();
	invoke(runtime, 106, 1000);
	assert.equal(runtime.registers.get("rax"), 0);
	invoke(runtime, 106, 2000);
	assert.equal(runtime.registers.getBigInt("rax"), -1n);
	assert.equal(runtime.host.snapshot().identity.groupId, 1000);
});

test("lets a privileged process replace every group credential", () => {
	const runtime = fixture({ effectiveUserId: 0, groupId: 1, userId: 0 });
	invoke(runtime, 106, 77);
	const identity = runtime.host.snapshot().identity;
	assert.equal(identity.groupId, 77);
	assert.equal(identity.effectiveGroupId, 77);
	assert.equal(identity.savedGroupId, 77);
	assert.equal(identity.filesystemGroupId, 77);
});

test("applies setresuid with unchanged real identity", () => {
	const runtime = fixture({ effectiveUserId: 0, userId: 0 });
	invoke(runtime, 117, -1n, 55, 66);
	const identity = runtime.host.snapshot().identity;
	assert.equal(identity.userId, 0);
	assert.equal(identity.effectiveUserId, 55);
	assert.equal(identity.savedUserId, 66);
	assert.equal(identity.filesystemUserId, 55);
});

test("returns the previous filesystem identity", () => {
	const runtime = fixture({
		effectiveUserId: 42,
		filesystemUserId: 42,
		savedUserId: 84,
		userId: 42
	});
	invoke(runtime, 122, 84);
	assert.equal(runtime.registers.get("rax"), 42);
	assert.equal(runtime.host.snapshot().identity.filesystemUserId, 84);
});

function fixture(options = {}) {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([stack.segment], {
		maximumBytes: 8192
	});
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
	setArgument(runtime.registers, "rdi", first);
	setArgument(runtime.registers, "rsi", second);
	setArgument(runtime.registers, "rdx", third);
	return runtime.host.handle(runtime.registers, runtime.memory);
}

function setArgument(registers, name, value) {
	registers.setBigInt(name, BigInt(value));
}
