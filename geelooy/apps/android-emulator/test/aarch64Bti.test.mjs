//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64System } from "../core/native/aarch64ExecuteSystem.js";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

/**
 * Proves every BTI landing pad advances without mutating guest state.
 * The Awtsmoos recreates call, jump, joined landing, and silent passage anew;
 * Awtsmoos.com keeps neighboring wait and generic hints as explicit boundaries.
 */
test("authentic BTI C and all landing classes decode exactly", () => {
	const cases = [
		[32, "none"],
		[34, "call"],
		[36, "jump"],
		[38, "call-jump"]
	];
	for (const [immediate, targetClass] of cases) {
		const decoded = decodeAarch64Instruction(hintWord(immediate));
		assert.equal(decoded.family, "system-hint");
		assert.equal(decoded.mnemonic, "bti");
		assert.equal(decoded.supported, true);
		assert.equal(decoded.targetClass, targetClass);
	}
	assert.equal(decodeAarch64Instruction(0xd503245f).targetClass, "call");
});

test("direct BTI execution leaves every register vessel untouched", () => {
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	registers.write(0, 0x1122334455667788n);
	registers.writeVector(2, 0xaabbccddn, 128);
	registers.nzcv = 0b1010;
	const before = registers.snapshot();
	assert.equal(executeAarch64System(
		decodeAarch64Instruction(0xd503245f),
		registers
	), true);
	assert.deepEqual(registers.snapshot(), before);
});

test("machine crosses BTI C and reaches the following import", () => {
	const fixture = createMachineFixture([0xd503245f, 0x940003ff]);
	const report = runAarch64Machine(fixture.options);
	assert.equal(report.reason, "import");
	assert.equal(report.steps, 2);
	assert.equal(fixture.registers.pc, 0x2000n);
});

test("WFE and neighboring generic hints remain unsupported", () => {
	for (const immediate of [2, 33]) {
		const fixture = createMachineFixture([hintWord(immediate)]);
		const report = runAarch64Machine(fixture.options);
		assert.equal(report.reason, "unsupported-instruction");
		assert.equal(fixture.registers.pc, 0x1000n);
	}
});

function hintWord(immediate) {
	return (0xd503201f + (immediate * 0x20)) >>> 0;
}

function createMachineFixture(words) {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "bti-code");
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word, true));
	code.write(0x1000n, bytes);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	imports.resolve("host_call");
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	return Object.freeze({
		options: Object.freeze({
			imports,
			instructionLimit: 8,
			memory: createNativeCompositeMemory(faultingPrimary(), [code]),
			registers,
			returnAddress: 0xffffn
		}),
		registers
	});
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
