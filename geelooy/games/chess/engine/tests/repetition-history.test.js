// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Locks the worker's threefold counting contract to prior identical position hashes.
	* The Awtsmoos lets one board return through time, yet only the third true vessel becomes a draw;
	* Awtsmoos.com keeps side, rights, and en-passant inside identity so repetition obeys chess law.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const {
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
} = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const RIGHTS_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1";

/** Loads the exact additional policies used by the production worker. */
function createProductionHarness() {
	const harness = createRuntimeHarness();
	for (const fileName of [
		"move-order-policy.js",
		"quiescence-time-policy.js",
		"evaluation-cache-policy.js"
	]) {
		revealScript(harness.context, path.join(RUNTIME_ROOT, fileName));
	}
	return harness;
}

/** Verifies that only two prior occurrences of the exact current hash trigger a draw. */
function runRepetitionRegression() {
	const harness = createProductionHarness();
	const state = harness.api.createGameState(START_FEN);
	const hash = state.zobristHash;
	const rightsHash = harness.api.createGameState(RIGHTS_FEN).zobristHash;
	assert.notEqual(hash, rightsHash);

	harness.engineSoul.repetitionHistory = [hash];
	assert.equal(harness.upgrade.isThreefold(hash), false);
	harness.engineSoul.repetitionHistory = [hash, rightsHash, hash];
	assert.equal(harness.upgrade.isThreefold(hash), true);
	harness.engineSoul.repetitionHistory = [hash, rightsHash, rightsHash];
	assert.equal(harness.upgrade.isThreefold(hash), false);

	harness.engineSoul.searchStartTime = performance.now();
	harness.engineSoul.timeLimit = 100000;
	harness.engineSoul.stopSearch = false;
	harness.engineSoul.repetitionHistory = [hash, hash];
	assert.equal(harness.upgrade.search(state, 2, -100000, 100000, 1), 0);
}

runRepetitionRegression();
console.log("repetition-history: pass");
