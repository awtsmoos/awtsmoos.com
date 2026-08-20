// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Compares legacy and allocation-light move ordering without touching production.
	* The Awtsmoos lets two vessels search identical branches beneath one measured sky;
	* Awtsmoos.com keeps only speed that preserves nodes, score, and chosen move nearby.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const {
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
} = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const DEPTH = 3;
const POSITION_SPECS = [
	{ bookIndex: null, plies: 0 },
	{ bookIndex: 47, plies: 4 },
	{ bookIndex: 103, plies: 6 },
	{ bookIndex: 167, plies: 7 },
	{ bookIndex: 241, plies: 8 },
	{ bookIndex: 319, plies: 9 }
];

/** Builds one deterministic position from the local grandmaster opening corpus. */
function createPosition(harness, specification) {
	const state = harness.api.createGameState(START_FEN);
	if (specification.bookIndex === null) return state;
	const converter = new harness.api.PgnConverter();
	const opening = harness.api.sourceBook[specification.bookIndex];
	converter.setState(state);
	const tokens = opening.pgn
		.replace(/(\d+\.)/g, "")
		.trim()
		.split(/\s+/)
		.filter((token) => token && !["1-0", "0-1", "1/2-1/2", "*"].includes(token));
	for (const san of tokens.slice(0, specification.plies)) {
		const move = converter.parseSan(san);
		if (move === null) break;
		converter.applyMove(move);
	}
	return state;
}

/** Searches one state with a cold table and fixed depth. */
function measure(harness, state) {
	harness.engineSoul.transpositionTable.clear();
	harness.upgrade.prepareHeuristics([]);
	harness.engineSoul.stopSearch = false;
	harness.engineSoul.nodeCount = 0;
	harness.engineSoul.searchStartTime = performance.now();
	harness.engineSoul.timeLimit = 100000;
	const startedAt = performance.now();
	const score = harness.upgrade.search(
		state,
		DEPTH,
		-harness.upgrade.MATE_SCORE,
		harness.upgrade.MATE_SCORE,
		0
	);
	const elapsedMs = performance.now() - startedAt;
	const entry = harness.engineSoul.transpositionTable.get(state.zobristHash);
	return {
		score,
		bestMove: entry?.move || 0,
		nodes: harness.engineSoul.nodeCount,
		elapsedMs
	};
}

/** Runs six behavior-preserving A/B comparisons and emits the aggregate speed ratio. */
function runComparison() {
	const baseline = createRuntimeHarness();
	const candidate = createRuntimeHarness();
	revealScript(candidate.context, path.join(RUNTIME_ROOT, "move-order-policy.js"));
	const results = [];
	for (const specification of POSITION_SPECS) {
		const oldResult = measure(baseline, createPosition(baseline, specification));
		const newResult = measure(candidate, createPosition(candidate, specification));
		assert.equal(newResult.nodes, oldResult.nodes, "node count changed");
		assert.equal(newResult.score, oldResult.score, "score changed");
		assert.equal(newResult.bestMove, oldResult.bestMove, "best move changed");
		results.push({ baseline: oldResult, candidate: newResult });
	}
	const baselineMs = results.reduce((sum, result) => sum + result.baseline.elapsedMs, 0);
	const candidateMs = results.reduce((sum, result) => sum + result.candidate.elapsedMs, 0);
	console.log(JSON.stringify({
		depth: DEPTH,
		positions: results.length,
		baselineMs,
		candidateMs,
		speedup: baselineMs / candidateMs,
		results
	}));
}

runComparison();
