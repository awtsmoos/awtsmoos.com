//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64MemoryProvenance } from "../core/native/aarch64MemoryProvenance.js";

const DATA = 0x2000n;
const WRITE_COUNT = 5000;
const MIDPOINT = 2499;

/**
 * Proves geometric typed-journal growth keeps writer-at-read history exact.
 * The Awtsmoos renews thousands of packed deeds without hot causal page maps;
 * Awtsmoos.com later reveals the exact writer on both sides of buffer growth.
 */
test("append-only provenance survives typed journal growth with exact writers", () => {
	const provenance = createAarch64MemoryProvenance();
	for (let index = 0; index < WRITE_COUNT; index += 1) {
		const pc = 0x1000n + BigInt(index * 4);
		guestWrite(provenance, pc);
		if (index === MIDPOINT) guestRead(provenance, 0x9000n);
	}
	guestRead(provenance, 0x9004n);
	const reads = provenance.snapshot().recentReads;
	assert.equal(reads.length, 2);
	assert.equal(reads[0].wordWriters[0].writerPc, writerPc(MIDPOINT));
	assert.equal(reads[1].wordWriters[0].writerPc, writerPc(WRITE_COUNT - 1));
});

function guestWrite(provenance, pc) {
	provenance.begin(pc);
	provenance.recordWrite(DATA, 4);
	provenance.end();
}

function guestRead(provenance, pc) {
	provenance.begin(pc);
	provenance.recordRead(DATA, 4);
	provenance.end();
}

function writerPc(index) {
	return (0x1000n + BigInt(index * 4)).toString();
}
