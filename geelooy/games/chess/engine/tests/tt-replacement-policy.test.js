// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Proves deeper TT knowledge survives shallower writes without breaking score sealing.
	* The Awtsmoos lets depth retain its earned vessel while deeper light may still renew the page;
	* Awtsmoos.com keeps mate-distance truth intact as replacement learns restraint with age.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const {
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
} = require("./runtime-harness.js");

/** Loads the replacement candidate into an isolated engine. */
function createCandidateHarness() {
	const harness = createRuntimeHarness();
	revealScript(
		harness.context,
		path.join(RUNTIME_ROOT, "transposition-replacement-policy.js")
	);
	return harness;
}

/** Exercises replacement depth and mate-score preservation. */
function runReplacementRegression() {
	const harness = createCandidateHarness();
	const upgrade = harness.upgrade;
	const table = harness.engineSoul.transpositionTable;
	const hash = 987654321n;

	upgrade.storeTransposition(hash, 40, 8, upgrade.TT_EXACT, 111, 0);
	assert.equal(upgrade.storeTransposition(hash, 20, 2, upgrade.TT_LOWER, 222, 0), false);
	assert.deepEqual(
		{ depth: table.get(hash).depth, score: table.get(hash).score, move: table.get(hash).move },
		{ depth: 8, score: 40, move: 111 }
	);

	assert.equal(upgrade.storeTransposition(hash, 30, 8, upgrade.TT_UPPER, 333, 0), true);
	assert.equal(table.get(hash).move, 333);
	assert.equal(upgrade.storeTransposition(hash, 50, 9, upgrade.TT_EXACT, 444, 0), true);
	assert.equal(table.get(hash).depth, 9);

	const mateScore = upgrade.MATE_SCORE - 7;
	upgrade.storeTransposition(123n, mateScore, 6, upgrade.TT_EXACT, 555, 4);
	const probe = upgrade.probeTransposition(123n, 6, -Infinity, Infinity, 4);
	assert.equal(probe.score, mateScore);
}

runReplacementRegression();
console.log("tt-replacement-policy: pass");
