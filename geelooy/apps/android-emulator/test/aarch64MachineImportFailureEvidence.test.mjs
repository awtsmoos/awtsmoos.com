//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { runAarch64MachineWithImports } from "../core/native/aarch64MachineWithImports.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

/**
 * Proves a thrown host import retains the exact preceding guest trace.
 * The Awtsmoos recreates failure and testimony without changing either face;
 * Awtsmoos.com preserves the original error while revealing its machine shore.
 */
test("AArch64 import failure preserves the current machine report", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "code");
	writeWords(code, 0x1000n, [0x528002a3, 0x940003ff]);
	const memory = createNativeCompositeMemory(faultingPrimary(), [code]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	assert.equal(imports.resolve("failing_call"), 0x2000n);
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	const sentinel = new Error("AUTHENTIC_IMPORT_FAILURE");
	const hostImports = createNativeHostImportRegistry({
		failing_call() {
			throw sentinel;
		}
	});
	assert.throws(() => runAarch64MachineWithImports({
		hostImports,
		imports,
		instructionLimit: 32,
		memory,
		registers,
		returnAddress: 0x3000n
	}), (error) => {
		const report = error.nativeMachineReport;
		assert.equal(error, sentinel);
		assert.equal(report.reason, "import");
		assert.equal(report.import.name, "failing_call");
		assert.equal(report.steps, 2);
		assert.equal(report.trace.length, 2);
		assert.equal(String(report.trace[0].address), "4096");
		assert.equal(String(report.trace[1].address), "4100");
		assert.equal(String(report.registers.pc), "8192");
		assert.deepEqual(error.nativeHostCalls, []);
		assert.ok(Object.isFrozen(error.nativeHostCalls));
		return true;
	});
});

function writeWords(region, address, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => {
		view.setUint32(index * 4, word, true);
	});
	region.write(address, bytes);
}

function faultingPrimary() {
	return {
		read(address, size) {
			throw new Error("PRIMARY_READ:" + address + ":" + size);
		},
		write(address, bytes) {
			throw new Error("PRIMARY_WRITE:" + address + ":" + bytes.length);
		}
	};
}
