// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Guards check-aware quiescence against stand-pat-in-check and missing quiet evasions.
	* The Awtsmoos lets a checked king answer every lawful threat before evaluation may speak;
	* Awtsmoos.com names mate when no escape remains and keeps calm positions tactically sleek.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const {
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
} = require("./runtime-harness.js");

const CHECKMATE_FEN = "7k/6Q1/5K2/8/8/8/8/8 b - - 0 1";
const QUIET_EVASION_FEN = "7k/8/8/8/8/8/8/K6R b - - 0 1";
const CALM_FEN = "8/5pk1/6p1/7p/7P/6P1/5PK1/8 w - - 0 1";

/** Loads the exact additional policies currently active in the production worker. */
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

/** Prepares deterministic direct qsearch or depth-zero search calls. */
function prepareSearch(harness) {
	harness.engineSoul.transpositionTable.clear();
	harness.upgrade.prepareHeuristics([]);
	harness.upgrade.resetEvaluationCache();
	harness.engineSoul.stopSearch = false;
	harness.engineSoul.nodeCount = 0;
	harness.engineSoul.searchStartTime = performance.now();
	harness.engineSoul.timeLimit = 100000;
}

/** Runs qsearch through the live global override. */
function quiescenceScore(harness, fen) {
	const state = harness.api.createGameState(fen);
	prepareSearch(harness);
	return harness.context.quiesce(
		state,
		-harness.upgrade.MATE_SCORE,
		harness.upgrade.MATE_SCORE,
		0
	);
}

/** Proves mate, quiet evasions, and calm stand-pat behavior. */
function runQuiescenceCheckRegression() {
	const harness = createProductionHarness();
	assert.equal(quiescenceScore(harness, CHECKMATE_FEN), -harness.upgrade.MATE_SCORE);

	const evasionState = harness.api.createGameState(QUIET_EVASION_FEN);
	assert.equal(harness.upgrade.legalMoves(evasionState).length, 2);
	assert.equal(harness.context.generateTacticalMoves(evasionState).length, 0);
	const qScore = quiescenceScore(harness, QUIET_EVASION_FEN);
	prepareSearch(harness);
	const fullDepthZero = harness.upgrade.search(
		harness.api.createGameState(QUIET_EVASION_FEN),
		0,
		-harness.upgrade.MATE_SCORE,
		harness.upgrade.MATE_SCORE,
		0
	);
	assert.equal(qScore, fullDepthZero);
	assert.equal(quiescenceScore(harness, CALM_FEN), 0);
}

runQuiescenceCheckRegression();
console.log("quiescence-check: pass");
