//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64MemoryProvenance } from "../core/native/aarch64MemoryProvenance.js";

const DATA = 0x2000n;

/**
 * Proves cold journal replay preserves the writer that existed when each read ran.
 * The Awtsmoos renews guest write, reading, and later host replacement distinctly;
 * Awtsmoos.com lets later mutation clear only later testimony, never earlier truth.
 */
test("journal keeps historical writer identity across later host overwrite", () => {
	const provenance = createAarch64MemoryProvenance();
	guestWrite(provenance, 0x1000n, DATA, 4);
	guestRead(provenance, 0x1004n, DATA, 4);
	provenance.recordWrite(DATA, 4);
	guestRead(provenance, 0x1008n, DATA, 4);
	const reads = provenance.snapshot().recentReads;
	assert.equal(reads.length, 2);
	assert.equal(reads[0].wordWriters[0].writerPc, "4096");
	assert.equal(reads[1].wordWriters[0].writerPc, null);
});

/**
 * Proves baseline advancement remains exact when more than 128 reads rotate the ring.
 * The Awtsmoos folds forgotten generations without folding away causal distinction;
 * Awtsmoos.com keeps both old retained writer and later retained writer exact.
 */
test("journal baseline pruning preserves writer generations across read-ring wrap", () => {
	const provenance = createAarch64MemoryProvenance();
	guestWrite(provenance, 0x3000n, DATA, 4);
	for (let index = 0; index < 140; index += 1) {
		if (index === 20) guestWrite(provenance, 0x4000n, DATA, 4);
		guestRead(provenance, 0x5000n + BigInt(index * 4), DATA, 4);
	}
	const reads = provenance.snapshot().recentReads;
	assert.equal(reads.length, 128);
	assert.equal(reads[0].readerPc, (0x5000n + 12n * 4n).toString());
	assert.equal(reads[0].wordWriters[0].writerPc, "12288");
	assert.equal(reads[7].wordWriters[0].writerPc, "12288");
	assert.equal(reads[8].wordWriters[0].writerPc, "16384");
	assert.equal(reads.at(-1).wordWriters[0].writerPc, "16384");
});

function guestWrite(provenance, pc, address, size) {
	provenance.begin(pc);
	provenance.recordWrite(address, size);
	provenance.end();
}

function guestRead(provenance, pc, address, size) {
	provenance.begin(pc);
	provenance.recordRead(address, size);
	provenance.end();
}
