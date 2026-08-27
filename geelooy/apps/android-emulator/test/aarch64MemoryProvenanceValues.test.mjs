//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

const BASE = 0x50000000n;
const FIELD = BASE + 0x3fn;
const WRITER_PC = 0x1110n;
const READER_PC = 0x2220n;
const VALUE = 0x1122334455667788n;

/**
 * Proves unaligned scalar lineage retains both read bytes and historical write value.
 * The Awtsmoos joins crossed words without losing which guest deed made them one;
 * Awtsmoos.com reports exact neutral testimony when terminal tracing must be done.
 */
test("provenance reports exact read and historical scalar write values", () => {
	const region = createNativeAnonymousMemory(BASE, 0x2000, "provenance-values");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	memory.beginAarch64Instruction(WRITER_PC);
	memory.writeU64(FIELD, VALUE);
	memory.endAarch64Instruction();
	memory.beginAarch64Instruction(READER_PC);
	assert.equal(memory.readU32(FIELD), 0x55667788);
	memory.endAarch64Instruction();
	const read = memory.aarch64ProvenanceSnapshot().recentReads.at(-1);
	assert.equal(read.valueHex, "0x55667788");
	assert.equal(read.valueTruncated, false);
	assert.equal(read.wordWriters.length, 2);
	for (const writer of read.wordWriters) {
		assert.equal(writer.writerPc, WRITER_PC.toString());
		assert.equal(writer.writeAddress, FIELD.toString());
		assert.equal(writer.writeSize, 8);
		assert.equal(writer.writeValueHex, "0x1122334455667788");
	}
});

/** Proves host overwrite still clears guest identity while retaining safe schema. */
test("host writes continue to clear historical guest writer identity", () => {
	const region = createNativeAnonymousMemory(BASE, 0x2000, "provenance-host-clear");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	memory.beginAarch64Instruction(WRITER_PC);
	memory.writeU32(FIELD, 0x10203040);
	memory.endAarch64Instruction();
	memory.writeU32(FIELD, 0x50607080);
	memory.beginAarch64Instruction(READER_PC);
	assert.equal(memory.readU32(FIELD), 0x50607080);
	memory.endAarch64Instruction();
	const writer = memory.aarch64ProvenanceSnapshot().recentReads.at(-1).wordWriters[0];
	assert.equal(writer.writerPc, null);
	assert.equal(writer.writeValueHex, "0x50607080");
});

function faultingPrimary() {
	return {
		read(address, size) {
			throw new Error(`PRIMARY_READ:${address}:${size}`);
		},
		write(address, bytes) {
			throw new Error(`PRIMARY_WRITE:${address}:${bytes.byteLength}`);
		}
	};
}
