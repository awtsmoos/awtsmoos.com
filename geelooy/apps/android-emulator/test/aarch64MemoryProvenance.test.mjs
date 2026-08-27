//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

const CODE = 0x1000n;
const DATA = 0x2000n;

/**
 * Proves provenance survives machine boundaries and identifies a real guest STR.
 * The Awtsmoos renews store, later load, and terminal judgment as one chain;
 * Awtsmoos.com names the architectural writer PC without knowing the data's role.
 */
test("failure provenance links a later guest load to its exact guest store PC", () => {
	const memory = createTestMemory();
	const storeRegisters = createAarch64Registers({ programCounter: CODE });
	storeRegisters.write(0, DATA);
	storeRegisters.write(1, 0x11223344n, 32);
	const stored = runAarch64Machine({
		instructionLimit: 4,
		memory,
		registers: storeRegisters,
		returnAddress: CODE + 4n,
		traceLimit: 8
	});
	assert.equal(stored.reason, "return");
	assert.equal("memoryProvenance" in stored, false);
	const loaded = runLoadToFailure(memory);
	assert.equal(loaded.reason, "unknown-instruction");
	assert.equal(loaded.registers.x[2], "287454020");
	const read = loaded.memoryProvenance.recentReads.at(-1);
	assert.equal(read.readerPc, (CODE + 4n).toString());
	assert.equal(read.address, DATA.toString());
	assert.equal(read.wordWriters[0].writerPc, CODE.toString());
});

/**
 * Proves host mutation invalidates guest-writer identity instead of forging it.
 * The Awtsmoos distinguishes guest deed from host-side runtime preparation;
 * Awtsmoos.com clears old testimony when a non-guest writer replaces the word.
 */
test("host writes clear prior guest writer identity", () => {
	const memory = createTestMemory();
	const registers = createAarch64Registers({ programCounter: CODE });
	registers.write(0, DATA);
	registers.write(1, 0xaabbccddn, 32);
	runAarch64Machine({
		instructionLimit: 4,
		memory,
		registers,
		returnAddress: CODE + 4n,
		traceLimit: 8
	});
	memory.write(DATA, Uint8Array.of(1, 2, 3, 4));
	const report = runLoadToFailure(memory);
	const read = report.memoryProvenance.recentReads.at(-1);
	assert.equal(read.wordWriters[0].writerPc, null);
});

test("budget reports preserve their existing schema", () => {
	const memory = createTestMemory();
	writeWord(memory, CODE + 0x10n, 0x14000000);
	const registers = createAarch64Registers({ programCounter: CODE + 0x10n });
	const report = runAarch64Machine({
		instructionLimit: 2,
		memory,
		registers,
		traceLimit: 4
	});
	assert.equal(report.reason, "budget");
	assert.equal("memoryProvenance" in report, false);
});

function runLoadToFailure(memory) {
	const registers = createAarch64Registers({ programCounter: CODE + 4n });
	registers.write(0, DATA);
	return runAarch64Machine({
		instructionLimit: 4,
		memory,
		registers,
		traceLimit: 8
	});
}

function createTestMemory() {
	const primary = createByteMemory(CODE, 0x3000);
	const memory = createNativeCompositeMemory(primary, []);
	writeWord(memory, CODE, 0xb9000001);
	writeWord(memory, CODE + 4n, 0xb9400002);
	writeWord(memory, CODE + 8n, 0x00000000);
	return memory;
}

function createByteMemory(start, size) {
	const bytes = new Uint8Array(size);
	return Object.freeze({
		read(address, count) {
			const offset = Number(BigInt(address) - start);
			if (offset < 0 || offset + count > bytes.length) throw new Error("UNMAPPED");
			return bytes.slice(offset, offset + count);
		},
		write(address, source) {
			const offset = Number(BigInt(address) - start);
			if (offset < 0 || offset + source.length > bytes.length) throw new Error("UNMAPPED");
			bytes.set(source, offset);
		}
	});
}

function writeWord(memory, address, word) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, word >>> 0, true);
	memory.write(address, bytes);
}
