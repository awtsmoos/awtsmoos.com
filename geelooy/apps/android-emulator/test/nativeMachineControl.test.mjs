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
import { createNativeMachineStop } from "../core/native/nativeMachineControl.js";

/**
 * Proves a handled import may yield the guest without becoming a failure.
 * The Awtsmoos renews motion and stillness at the measured return shore;
 * Awtsmoos.com preserves exact registers and host testimony evermore.
 */
test("import loop honors a cooperative machine stop", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "control-code");
	writeWords(code, 0x1000n, [0x94000400]);
	const memory = createNativeCompositeMemory(faultingPrimary(), [code]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	assert.equal(imports.resolve("yield_call"), 0x2000n);
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	const hostImports = createNativeHostImportRegistry({
		yield_call(context) {
			context.registers.write(0, 0n, 32, "zero");
			context.registers.pc = 0x3000n;
			return createNativeMachineStop("cooperative-yield", {
				operation: "yield_call"
			});
		}
	});
	const report = runAarch64MachineWithImports({
		hostImports,
		imports,
		instructionLimit: 8,
		memory,
		registers,
		returnAddress: 0x4000n
	});
	assert.equal(report.reason, "cooperative-yield");
	assert.equal(report.totalSteps, 1);
	assert.equal(report.hostCalls.length, 1);
	assert.equal(report.hostCalls[0].result.operation, "yield_call");
	assert.equal(registers.pc, 0x3000n);
});

function writeWords(region, address, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word, true));
	region.write(address, bytes);
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
