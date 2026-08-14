//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";

/**
 * Proves set_tid_address returns the TID and clears guest memory during exit.
 * The Awtsmoos renews thread identity, clear pointer, process departure, and wake;
 * Awtsmoos.com models Linux lifecycle instead of returning an arbitrary success.
 */

test("stores clear-child-TID and clears it on exit", () => {
	const memory = createMemory();
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: 0x3000,
		stackTop: 0x4000
	});
	const syscalls = createPortableSyscallHost(
		"linux-x86-64",
		{},
		{ threadId: 77 }
	);
	memory.write32(0x2004, 77);
	registers.set("rax", 218);
	registers.set("rdi", 0x2004);
	const configured = syscalls.handle(registers, memory);
	assert.equal(configured.result, 77);
	assert.equal(registers.get("rax"), 77);
	assert.equal(syscalls.snapshot().thread.clearChildTid, 0x2004);
	registers.set("rax", 60);
	registers.set("rdi", 9);
	const exited = syscalls.handle(registers, memory);
	assert.equal(exited.halted, true);
	assert.equal(exited.exitCode, 9);
	assert.equal(exited.clearChildTid.address, 0x2004);
	assert.equal(exited.clearChildTid.futexWakeCount, 1);
	assert.equal(memory.u32(0x2004), 0);
	assert.equal(
		syscalls.snapshot().thread.clearChildTidCleared,
		true
	);
});

test("uses process ID as the default thread identity", () => {
	const memory = createMemory();
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: 0x3000,
		stackTop: 0x4000
	});
	const syscalls = createPortableSyscallHost(
		"linux-x86-64",
		{},
		{ processId: 42 }
	);
	registers.set("rax", 218);
	registers.set("rdi", 0);
	syscalls.handle(registers, memory);
	assert.equal(registers.get("rax"), 42);
	assert.equal(syscalls.snapshot().thread.threadId, 42);
});

function createMemory() {
	return new PortableByteMemory([
		segment(0x1000, new Uint8Array([0xc3]), {
			execute: true,
			read: true
		}),
		segment(0x2000, new Uint8Array(0x100), {
			read: true,
			write: true
		}),
		segment(0x3000, new Uint8Array(0x1000), {
			read: true,
			write: true
		})
	]);
}

function segment(address, bytes, flags) {
	return {
		address,
		bytes,
		flags,
		name: `fixture-${address.toString(16)}`
	};
}
