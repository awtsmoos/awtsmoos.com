// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Compares current ordering with promotion-aware ordering on small endgame positions.
	* The Awtsmoos lets crowns enter early only when search returns the same truthful decree;
	* Awtsmoos.com measures nodes and time before promotion priority may touch the living tree.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { RUNTIME_ROOT, createRuntimeHarness, revealScript } = require("./runtime-harness.js");

const DEPTH = 4;
const POSITIONS = [
	"7k/P7/8/8/8/8/8/7K w - - 0 1",
	"7K/8/8/8/8/8/p7/7k b - - 0 1",
	"1r5k/P7/8/8/8/8/8/7K w - - 0 1"
];

/** Loads one selected ordering policy into an isolated harness. */
function createHarness(policyFile) {
	const harness = createRuntimeHarness();
	revealScript(harness.context, path.join(RUNTIME_ROOT, policyFile));
	return harness;
}

/** Searches one fixed position from cold TT and heuristics. */
function measure(harness, fen) {
	const state = harness.api.createGameState(fen);
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

/** Runs the promotion A/B and emits aggregate evidence. */
function runComparison() {
	const baseline = createHarness("move-order-policy.js");
	const candidate = createHarness("move-order-promotion-candidate.js");
	const results = [];
	for (const fen of POSITIONS) {
		const oldResult = measure(baseline, fen);
		const newResult = measure(candidate, fen);
		assert.equal(newResult.score, oldResult.score, `score changed for ${fen}`);
		assert.equal(newResult.bestMove, oldResult.bestMove, `best move changed for ${fen}`);
		results.push({ fen, baseline: oldResult, candidate: newResult });
	}
	const totals = results.reduce(
		(accumulator, result) => ({
			baselineNodes: accumulator.baselineNodes + result.baseline.nodes,
			candidateNodes: accumulator.candidateNodes + result.candidate.nodes,
			baselineMs: accumulator.baselineMs + result.baseline.elapsedMs,
			candidateMs: accumulator.candidateMs + result.candidate.elapsedMs
		}),
		{ baselineNodes: 0, candidateNodes: 0, baselineMs: 0, candidateMs: 0 }
	);
	console.log(JSON.stringify({ ...totals, results }));
}

runComparison();
