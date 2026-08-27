//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { registerNativeQsortHandlers } from "../core/native/nativeQsortHandlers.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

test("authentic NULL zero-element qsort is a lawful no-op", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0n);
	fixture.registers.write(1, 0n);
	fixture.registers.write(2, 8n);
	fixture.registers.write(3, 0x1100n);
	const handled = invoke(fixture, "qsort");
	assert.equal(handled.result.count, "0");
	assert.equal(handled.result.comparisons, 0);
	assert.equal(handled.result.swaps, 0);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("qsort orders guest values through a real AArch64 comparator", () => {
	const fixture = createFixture();
	writeWords(fixture.memory, 0x1100n, [
		0xaa1e03f3,
		bl(0x1104n, 0x2000n),
		0xaa1303fe,
		0xd65f03c0
	]);
	writeU64(fixture.memory, 0x3000n, [3n, 1n, 2n]);
	fixture.registers.write(0, 0x3000n);
	fixture.registers.write(1, 3n);
	fixture.registers.write(2, 8n);
	fixture.registers.write(3, 0x1100n);
	const handled = invoke(fixture, "qsort");
	assert.deepEqual(readU64(fixture.memory, 0x3000n, 3), [1n, 2n, 3n]);
	assert.ok(handled.result.comparisons >= 2);
	assert.ok(handled.result.swaps >= 2);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

function createFixture() {
	const region = createNativeAnonymousMemory(0x1000n, 0x4000, "qsort");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	imports.resolve("compare_u64");
	const registry = createNativeHostImportRegistry();
	registerNativeQsortHandlers(registry, { imports });
	registry.register("compare_u64", context => {
		const left = readOneU64(context.memory, context.registers.read(0));
		const right = readOneU64(context.memory, context.registers.read(1));
		const result = left < right ? -1 : left > right ? 1 : 0;
		context.registers.write(0, BigInt.asUintN(32, BigInt(result)), 32, "zero");
		context.registers.pc = context.registers.read(30, 64, "zero");
		return Object.freeze({ operation: "compare_u64", result });
	});
	const registers = createAarch64Registers({
		programCounter: 0x9000n,
		stackPointer: 0x4ff0n
	});
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	return { imports, memory, registers, registry, systemRegisters };
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

function writeWords(memory, address, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word, true));
	memory.write(address, bytes);
}

function bl(from, to) {
	return (0x94000000 | Number((to - from) / 4n)) >>> 0;
}

function writeU64(memory, address, values) {
	const bytes = new Uint8Array(values.length * 8);
	const view = new DataView(bytes.buffer);
	values.forEach((value, index) => view.setBigUint64(index * 8, value, true));
	memory.write(address, bytes);
}

function readU64(memory, address, count) {
	return Array.from({ length: count }, (_, index) => {
		return readOneU64(memory, address + BigInt(index * 8));
	});
}

function readOneU64(memory, address) {
	const bytes = memory.read(address, 8);
	return new DataView(bytes.buffer, bytes.byteOffset, 8).getBigUint64(0, true);
}

function faultingPrimary() {
	return {
		read(address, size) {
			throw new Error(`PRIMARY_READ:${address}:${size}`);
		},
		write(address, bytes) {
			throw new Error(`PRIMARY_WRITE:${address}:${bytes.length}`);
		}
	};
}
