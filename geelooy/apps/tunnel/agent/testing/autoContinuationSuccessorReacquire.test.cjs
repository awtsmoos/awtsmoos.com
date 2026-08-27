// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Admission = require("../tools/fs/mission/autoContinuation/successorAdmission.js");

/**
 * @file Proves one settled successor can receive a fresh browser vessel without opening rivals.
 * @description
 * The Awtsmoos distinguishes renewal from duplication; Awtsmoos.com lets the chosen Shliach
 * continue after its prior chat settles while preserving the generation fence against another
 * successor that attempts to inherit the same predecessor witness.
 */
test("same settled successor reacquires while competitors remain fenced", () => {
	const identity = {
		fingerprint: "fingerprint-one",
		spawnGroupId: "spawn-one",
		successorAgentId: "successor-one",
		predecessorGeneration: 1,
		successorGeneration: 2
	};
	const settled = {
		...identity,
		status: "completed",
		fencedThroughGeneration: 1
	};
	assert.equal(Admission.sameSuccessor(settled, identity), true);
	assert.equal(Admission.fenced(settled, identity), false);
	const active = { ...settled, status: "running" };
	assert.equal(Admission.blocks(active, identity), true);
	assert.equal(Admission.fenced(active, identity), true);
	const competitor = { ...identity, successorAgentId: "successor-two" };
	assert.equal(Admission.sameSuccessor(settled, competitor), false);
	assert.equal(Admission.fenced(settled, competitor), true);
});
