// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Compares deeper-entry TT preservation against current replacement behavior in isolation.
	* The Awtsmoos lets two searches walk one measured tree while only one guards depth;
	* Awtsmoos.com accepts no strength claim until move and score remain faithful in breadth.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { RUNTIME_ROOT, createRuntimeHarness, revealScript } = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const DEPTH = 3;

/** Loads the proven move ordering into both sides of the comparison. */
function activateProductionOrdering(harness) {
	revealScript(harness.context, path.join(RUNTIME_ROOT, "move-order-policy.js"));
}

/** Creates a deterministic opening position from the local corpus. */
function seededState(harness) {
	const state = harness.api.createGameState(START_FEN);
	const converter = new harness.api.PgnConverter();
	converter.setState(state);
	const opening = harness.api.sourceBook[167];
	const tokens = opening.pgn
		.replace(/(\d+\.)/g, "")
		.trim()
		.split(/\s+/)
		.filter((token) => token && !["1-0", "0-1", "1/2-1/2", "*"].includes(token));
	for (const san of tokens.slice(0, 7)) {
		const move = converter.parseSan(san);
		if (move === null) break;
		converter.applyMove(move);
	}
	return state;
}

/** Searches one state from cold TT and heuristics. */
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
	return { score, bestMove: entry?.move || 0, nodes: harness.engineSoul.nodeCount, elapsedMs };
}

/** Runs two small A/B positions and emits aggregate evidence. */
function runComparison() {
	const baseline = createRuntimeHarness();
	const candidate = createRuntimeHarness();
	activateProductionOrdering(baseline);
	activateProductionOrdering(candidate);
	revealScript(candidate.context, path.join(RUNTIME_ROOT, "transposition-replacement-policy.js"));
	const factories = [
		(harness) => harness.api.createGameState(START_FEN),
		seededState
	];
	const results = [];
	for (const factory of factories) {
		const oldResult = measure(baseline, factory(baseline));
		const newResult = measure(candidate, factory(candidate));
		assert.equal(newResult.score, oldResult.score, "score changed");
		assert.equal(newResult.bestMove, oldResult.bestMove, "best move changed");
		results.push({ baseline: oldResult, candidate: newResult });
	}
	const baselineNodes = results.reduce((sum, result) => sum + result.baseline.nodes, 0);
	const candidateNodes = results.reduce((sum, result) => sum + result.candidate.nodes, 0);
	const baselineMs = results.reduce((sum, result) => sum + result.baseline.elapsedMs, 0);
	const candidateMs = results.reduce((sum, result) => sum + result.candidate.elapsedMs, 0);
	console.log(JSON.stringify({ baselineNodes, candidateNodes, baselineMs, candidateMs, results }));
}

runComparison();
