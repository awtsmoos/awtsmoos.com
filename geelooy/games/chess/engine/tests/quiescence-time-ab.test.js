// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests tighter quiescence timing for semantic equivalence and lower clock overshoot.
	* The Awtsmoos keeps the same tactical truth while the promised moment draws nearer;
	* Awtsmoos.com measures both depth and clock so responsiveness becomes clearer.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { RUNTIME_ROOT, createRuntimeHarness, revealScript } = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const TACTICAL_FEN = "r3k2r/p1ppqpb1/bn2pnp1/2pP4/1p2P3/2N2N2/PPQBBPPP/R3K2R w KQkq - 0 1";

/** Creates baseline or candidate with current production move ordering active. */
function createHarness(useResponsiveQuiescence) {
	const harness = createRuntimeHarness();
	revealScript(harness.context, path.join(RUNTIME_ROOT, "move-order-policy.js"));
	if (useResponsiveQuiescence) {
		revealScript(harness.context, path.join(RUNTIME_ROOT, "quiescence-time-candidate.js"));
	}
	return harness;
}

/** Fixed-depth search used to prove the candidate does not change untimed semantics. */
function measureFixedDepth(harness, fen) {
	const state = harness.api.createGameState(fen);
	harness.engineSoul.transpositionTable.clear();
	harness.upgrade.prepareHeuristics([]);
	harness.engineSoul.stopSearch = false;
	harness.engineSoul.nodeCount = 0;
	harness.engineSoul.searchStartTime = performance.now();
	harness.engineSoul.timeLimit = 100000;
	const score = harness.upgrade.search(
		state,
		3,
		-harness.upgrade.MATE_SCORE,
		harness.upgrade.MATE_SCORE,
		0
	);
	const entry = harness.engineSoul.transpositionTable.get(state.zobristHash);
	return { score, bestMove: entry?.move || 0, nodes: harness.engineSoul.nodeCount };
}

/** Measures one intentionally short iterative search and verifies its fallback move is legal. */
function measureShortSearch(harness) {
	const state = harness.api.createGameState(TACTICAL_FEN);
	harness.engineSoul.transpositionTable.clear();
	const legalMoves = harness.upgrade.legalMoves(state);
	const startedAt = performance.now();
	const result = harness.upgrade.searchRoot(state, 99, 25, []);
	const elapsedMs = performance.now() - startedAt;
	assert.ok(legalMoves.includes(result.bestMove), "short search returned an illegal move");
	return elapsedMs;
}

/** Runs equivalence checks and a tiny repeated low-time responsiveness comparison. */
function runComparison() {
	const baseline = createHarness(false);
	const candidate = createHarness(true);
	for (const fen of [START_FEN, TACTICAL_FEN]) {
		const oldResult = measureFixedDepth(baseline, fen);
		const newResult = measureFixedDepth(candidate, fen);
		assert.deepEqual(newResult, oldResult, `fixed-depth behavior changed for ${fen}`);
	}
	const baselineTimes = [];
	const candidateTimes = [];
	for (let iteration = 0; iteration < 4; iteration++) {
		baselineTimes.push(measureShortSearch(baseline));
		candidateTimes.push(measureShortSearch(candidate));
	}
	const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
	console.log(JSON.stringify({
		baselineTimes,
		candidateTimes,
		baselineAverageMs: average(baselineTimes),
		candidateAverageMs: average(candidateTimes)
	}));
}

runComparison();
