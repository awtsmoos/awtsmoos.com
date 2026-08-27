//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer, writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeSignalHandlers } from "../core/native/nativeSignalHandlers.js";
import { addNativeSignal, createEmptyNativeSignalSet, writeNativeSignalSet } from "../core/native/nativeSignalSet.js";

const FRAME_START = 0x1800n;
const OLD_SET = FRAME_START + 8n;
const SAVED_LINK_REGISTER = FRAME_START + 16n;
const RETURN_SENTINEL = 0x6fffffff0000n;
const IMPORT_RETURN = 0x7777n;
const THREAD = 0x6fffe0000000n;
const SET_ADDRESS = 0x1100n;

/**
 * Recreates the authentic Flutter frame around pthread_sigmask old-set storage.
 * The Awtsmoos renews eight mask bytes while the saved return road remains bright;
 * Awtsmoos.com proves the helper can return to its sentinel instead of PC-zero night.
 */
test("old-set capture at sp+8 preserves saved X30 at sp+16", () => {
	const fixture = createFixture();
	fixture.memory.write(FRAME_START, new Uint8Array(80).fill(0x5a));
	writeAarch64Integer(fixture.memory, SAVED_LINK_REGISTER, RETURN_SENTINEL, 64);
	invoke(fixture, 0n, 0n, OLD_SET);
	assert.deepEqual([...fixture.memory.read(OLD_SET, 8)], new Array(8).fill(0));
	assert.equal(
		readAarch64Integer(fixture.memory, SAVED_LINK_REGISTER, 64),
		RETURN_SENTINEL
	);
	assert.deepEqual(
		[...fixture.memory.read(FRAME_START + 24n, 56)],
		new Array(56).fill(0x5a)
	);
	assert.equal(fixture.registers.pc, IMPORT_RETURN);
});

test("mask restoration reads the same eight-byte slot without adjacent mutation", () => {
	const fixture = createFixture();
	fixture.memory.write(FRAME_START, new Uint8Array(80).fill(0x5a));
	writeAarch64Integer(fixture.memory, SAVED_LINK_REGISTER, RETURN_SENTINEL, 64);
	const blocked = createEmptyNativeSignalSet();
	addNativeSignal(blocked, 2);
	writeNativeSignalSet(fixture.memory, SET_ADDRESS, blocked);
	invoke(fixture, 0n, SET_ADDRESS, OLD_SET);
	invoke(fixture, 2n, OLD_SET, 0n);
	assert.equal(
		readAarch64Integer(fixture.memory, SAVED_LINK_REGISTER, 64),
		RETURN_SENTINEL
	);
	assert.deepEqual(
		[...fixture.memory.read(FRAME_START + 24n, 56)],
		new Array(56).fill(0x5a)
	);
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x1000n, 0x1000, "signal-frame");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	const registry = createNativeHostImportRegistry();
	registerNativeSignalHandlers(registry, {}, null);
	return Object.freeze({ memory, registers, registry, systemRegisters });
}

function invoke(fixture, how, setAddress, oldAddress) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, how);
	fixture.registers.write(1, setAddress);
	fixture.registers.write(2, oldAddress);
	fixture.registers.write(30, IMPORT_RETURN);
	return fixture.registry.handle({ name: "pthread_sigmask" }, fixture);
}
