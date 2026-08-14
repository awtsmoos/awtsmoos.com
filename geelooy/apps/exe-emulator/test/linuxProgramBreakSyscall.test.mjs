//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createLinuxSyscallState } from "../core/portable/linuxSyscallState.js";
import { dispatchLinuxSyscall } from "../core/portable/linuxSyscallDispatch.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";

const INITIAL = 0x713fdd;
const STACK_BASE = 0x800000;
const STACK_TOP = 0x801000;

function createFixture(options = {}) {
	const memory = new PortableByteMemory([
		{
			address: 0x711fe0,
			flags: { read: true, write: true },
			memorySize: 0x1ffd,
			name: "image-data"
		},
		...(options.extraSegments || [])
	], options.memoryOptions || {});
	const registers = new PortableRegisterFile(0x400000, {
		memory,
		stackBase: STACK_BASE,
		stackTop: STACK_TOP
	});
	const state = createLinuxSyscallState({
		initialProgramBreak: INITIAL
	});
	return { memory, registers, state };
}

function brk(fixture, address) {
	fixture.registers.setBigInt("rdi", BigInt(address));
	return dispatchLinuxSyscall(
		12,
		fixture.registers,
		fixture.memory,
		fixture.state
	);
}

/**
 * Proves Linux query and first growth preserve the exact unaligned image break.
 * The Awtsmoos renews guest desire at 0x713fdd while pages carry backing light;
 * Awtsmoos.com maps only beyond PT_LOAD so no existing byte is overwritten in flight.
 */
test("queries and grows from the exact non-page-aligned image end", () => {
	const fixture = createFixture();
	assert.equal(brk(fixture, 0).result, INITIAL);
	const grown = brk(fixture, 0x714123);
	assert.equal(grown.result, 0x714123);
	assert.equal(fixture.state.programBreak.mappedEnd, 0x715000);
	const heap = fixture.memory.segmentMetadata().find(
		segment => segment.name === "linux-brk-0"
	);
	assert.equal(heap.address, INITIAL);
	assert.equal(heap.end, 0x715000);
	assert.equal(heap.permissions, "rw-");
});

test("shrinks logically and regrows without remapping reserved pages", () => {
	const fixture = createFixture();
	brk(fixture, 0x716000);
	fixture.memory.write8(0x714010, 0x5a);
	brk(fixture, 0x714000);
	const segmentCount = fixture.memory.segmentMetadata().length;
	brk(fixture, 0x715000);
	assert.equal(fixture.memory.segmentMetadata().length, segmentCount);
	assert.equal(fixture.memory.u8(0x714010), 0x5a);
});

test("returns the old break when growth collides with another mapping", () => {
	const fixture = createFixture({
		extraSegments: [{
			address: 0x715000,
			flags: { read: true, write: true },
			memorySize: 0x1000,
			name: "collision"
		}]
	});
	const result = brk(fixture, 0x715100);
	assert.equal(result.accepted, false);
	assert.equal(result.result, INITIAL);
	assert.equal(fixture.state.programBreak.current, INITIAL);
});

test("rejects below-initial and unsafe qword addresses", () => {
	const fixture = createFixture();
	assert.equal(brk(fixture, INITIAL - 1).result, INITIAL);
	fixture.registers.setBigInt("rdi", 0xffffffffffffffffn);
	const result = dispatchLinuxSyscall(
		12,
		fixture.registers,
		fixture.memory,
		fixture.state
	);
	assert.equal(result.accepted, false);
	assert.equal(result.result, INITIAL);
});
