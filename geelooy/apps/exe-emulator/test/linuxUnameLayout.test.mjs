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
const FIELD_BYTES = 65;
const FIELD_NAMES = [
	"sysname",
	"nodename",
	"release",
	"version",
	"machine",
	"domainname"
];

/**
 * Proves Linux uname writes six fixed, terminated, zero-padded guest fields.
 * The Awtsmoos renews kernel identity in bounded bytes with no host-name trace;
 * Awtsmoos.com snapshots configured guest truth and keeps every field in place.
 */
test("writes deterministic default new_utsname layout", () => {
	const runtime = fixture();
	invoke(runtime);
	assert.equal(runtime.registers.get("rax"), 0);
	assert.deepEqual(readFields(runtime.memory), [
		"Linux",
		"awtsmoos",
		"6.6.0-awtsmoos",
		"#1 Awtsmoos SMP",
		"x86_64",
		"localdomain"
	]);
	for (let index = 0; index < FIELD_NAMES.length; index += 1) {
		const field = runtime.memory.bytes(
			BUFFER + index * FIELD_BYTES,
			FIELD_BYTES
		);
		const zero = field.indexOf(0);
		assert.notEqual(zero, -1);
		assert.ok(field.slice(zero).every(value => value === 0));
	}
});

test("uses configured guest identity and exposes it in snapshot", () => {
	const utsname = {
		domainname: "example.test",
		machine: "x86_64",
		nodename: "geelooy-node",
		release: "9.1.2-geelooy",
		sysname: "Linux",
		version: "#7 Geelooy SMP"
	};
	const runtime = fixture({ utsname });
	invoke(runtime);
	assert.deepEqual(readFields(runtime.memory), FIELD_NAMES.map(
		field => utsname[field]
	));
	assert.deepEqual(runtime.host.snapshot().system, utsname);
});

function fixture(options = {}) {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: BUFFER,
			bytes: new Uint8Array(390),
			flags: { read: true, write: true },
			name: "utsname"
		},
		stack.segment
	], { maximumBytes: 8192 });
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

function invoke(runtime) {
	runtime.registers.set("rax", 63);
	runtime.registers.set("rdi", BUFFER);
	runtime.host.handle(runtime.registers, runtime.memory);
}

function readFields(memory) {
	return FIELD_NAMES.map((field, index) => {
		const value = memory.ascii(BUFFER + index * FIELD_BYTES, FIELD_BYTES);
		return value.split("\u0000", 1)[0];
	});
}
