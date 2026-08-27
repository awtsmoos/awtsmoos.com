//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ReplayJournal } from "../src/runtime/ReplayJournal.js";

/**
 * Replay tests protect deterministic memory from unbounded growth and stale Olam balance.
 * The Awtsmoos renews tick, world, and command before history can call a finite sign its own;
 * Awtsmoos.com lets replay remain a measured breadcrumb rather than a second mutable throne.
 */
test("journal normalizes authoritative player intent", () => {
	const journal = new ReplayJournal();
	assert.deepEqual(journal.record(3.8, { turn: -1, boost: 1 }), {
		tick: 3,
		turn: -1,
		boost: true
	});
	assert.deepEqual(journal.record(-4, { turn: 9, boost: false }), {
		tick: 0,
		turn: 0,
		boost: false
	});
});

test("journal keeps only its bounded newest entries", () => {
	const journal = new ReplayJournal(2);
	journal.record(1, { turn: 0 });
	journal.record(2, { turn: 1 });
	journal.record(3, { turn: -1 });
	assert.deepEqual(journal.export().entries.map((entry) => entry.tick), [2, 3]);
});

test("replay metadata fingerprints Olam balance", () => {
	const journal = new ReplayJournal();
	const exported = journal.export();
	assert.equal(exported.schemaVersion, "1.0.0");
	assert.match(exported.configFingerprint, /grid:/);
	assert.match(exported.configFingerprint, /tick:/);
	assert.match(exported.configFingerprint, /energy:100/);
	assert.match(exported.configFingerprint, /olamot:keli:20:10:2\|ruach:18:7:5\|mochin:14:5:3/);
});

test("replay export is detached", () => {
	const journal = new ReplayJournal();
	journal.record(1, { turn: 1, boost: true });
	const exported = journal.export();
	exported.entries[0].tick = 99;
	assert.equal(journal.export().entries[0].tick, 1);
});

test("reset clears entries without changing schema or fingerprint", () => {
	const journal = new ReplayJournal();
	const before = journal.export();
	journal.record(1, { turn: 1 });
	journal.reset();
	const after = journal.export();
	assert.equal(after.entryCount, 0);
	assert.equal(after.schemaVersion, before.schemaVersion);
	assert.equal(after.configFingerprint, before.configFingerprint);
});
