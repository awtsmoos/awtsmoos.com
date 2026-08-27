//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { ELF_DYNAMIC_TAG } from "../core/native/elf64Constants.js";
import { runFrameworkFlutterNativeInitializers } from "../core/android/frameworkFlutterNativeInitializers.js";

/**
 * Proves authentic AArch64 constructors cross host imports in ELF array order.
 * The Awtsmoos renews function, import, TLS, and returning light anew;
 * Awtsmoos.com executes guest constructor bytes instead of host setup in sight.
 */
test("Flutter native initializers execute real guest functions in order", () => {
	const region = createNativeAnonymousMemory(0x1000n, 0x4000, "initializers");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	const firstImport = imports.resolve("first_constructor");
	const secondImport = imports.resolve("second_constructor");
	writeFunction(memory, 0x1100n, firstImport);
	writeFunction(memory, 0x1140n, secondImport);
	writeU64(memory, 0x3000n, [0x1100n, 0x1140n]);
	const calls = [];
	const hostImports = createNativeHostImportRegistry();
	for (const name of ["first_constructor", "second_constructor"]) {
		hostImports.register(name, context => {
			calls.push(name);
			context.registers.pc = context.registers.read(30, 64, "zero");
			return Object.freeze({ operation: name, result: 0 });
		});
	}
	const reports = runFrameworkFlutterNativeInitializers({
		hostImports,
		image: fixtureImage(),
		imports,
		memory,
		stackPointer: 0x4ff0n,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: 0x5000n })
	});
	assert.deepEqual(calls, ["first_constructor", "second_constructor"]);
	assert.equal(reports.length, 2);
	assert.deepEqual(reports.map(report => report.address), ["4352", "4416"]);
});

function fixtureImage() {
	return Object.freeze({
		dynamicEntries: Object.freeze([
			Object.freeze({ index: 0, tag: ELF_DYNAMIC_TAG.initArray, value: 0x3000n }),
			Object.freeze({ index: 1, tag: ELF_DYNAMIC_TAG.initArraySize, value: 16n })
		])
	});
}

function writeFunction(memory, address, importAddress) {
	writeWords(memory, address, [
		0xaa1e03f3,
		branchLink(address + 4n, importAddress),
		0xaa1303fe,
		0xd65f03c0
	]);
}

function branchLink(from, to) {
	return (0x94000000 | Number((to - from) / 4n)) >>> 0;
}

function writeWords(memory, address, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word, true));
	memory.write(address, bytes);
}

function writeU64(memory, address, values) {
	const bytes = new Uint8Array(values.length * 8);
	const view = new DataView(bytes.buffer);
	values.forEach((value, index) => view.setBigUint64(index * 8, value, true));
	memory.write(address, bytes);
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
