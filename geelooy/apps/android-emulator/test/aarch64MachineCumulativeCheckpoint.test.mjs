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
 * Proves host-import density cannot reset distance to a cumulative checkpoint.
 * The Awtsmoos counts each guest BL across repeated host doors; Awtsmoos.com
 * engraves step five even though no uninterrupted machine segment can reach five.
 */
test("AArch64 checkpoints cumulative guest steps across dense host imports", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "code");
	writeWord(code, 0x1000n, 0x94000400);
	const memory = createNativeCompositeMemory(faultingPrimary(), [code]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	assert.equal(imports.resolve("host_call"), 0x2000n);
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	const hostImports = createNativeHostImportRegistry({
		host_call(context) {
			context.registers.pc = 0x1000n;
			return Object.freeze({ returnCode: 0 });
		}
	});
	const checkpoints = [];
	const report = runAarch64MachineWithImports({
		checkpointInstructionLimit: 5,
		hostCallLimit: 16,
		hostImports,
		imports,
		instructionLimit: 10,
		memory,
		onCheckpoint(checkpoint) {
			checkpoints.push(checkpoint.totalSteps);
		},
		registers,
		traceLimit: 4
	});
	assert.equal(report.reason, "budget");
	assert.equal(report.totalSteps, 10);
	assert.deepEqual(checkpoints, [5]);
	assert.equal(report.hostCalls.length, 9);
});

function writeWord(memory, address, word) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, word, true);
	memory.write(address, bytes);
}

function faultingPrimary() {
	return Object.freeze({
		read(address, size) {
			throw new Error(`PRIMARY_READ:${address}:${size}`);
		},
		write(address, bytes) {
			throw new Error(`PRIMARY_WRITE:${address}:${bytes.length}`);
		}
	});
}
