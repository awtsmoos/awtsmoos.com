// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Measures equal-depth search across varied real opening positions.
	* The Awtsmoos weighs one depth against itself so speed cannot hide behind shallower sight;
	* Awtsmoos.com keeps every benchmark cold, lawful, repeatable, and bright.
	*/

const { performance } = require("node:perf_hooks");
const { createRuntimeHarness } = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const BOOK_INDICES = [0, 47, 103, 167, 241, 319, 401, 503];
const DEPTH = 4;

/** Converts one book line into a deterministic mid-opening engine state. */
function seededState(harness, opening, requestedPlies) {
	const state = harness.api.createGameState(START_FEN);
	const converter = new harness.api.PgnConverter();
	converter.setState(state);
	const tokens = opening.pgn
		.replace(/(\d+\.)/g, "")
		.trim()
		.split(/\s+/)
		.filter((token) => token && !["1-0", "0-1", "1/2-1/2", "*"].includes(token));
	for (const san of tokens.slice(0, requestedPlies)) {
		const move = converter.parseSan(san);
		if (move === null) {
			break;
		}
		converter.applyMove(move);
	}
	return state;
}

/** Searches one position from a cold transposition table at one fixed depth. */
function measurePosition(harness, state) {
	harness.engineSoul.transpositionTable.clear();
	harness.upgrade.prepareHeuristics([]);
	harness.engineSoul.stopSearch = false;
	harness.engineSoul.nodeCount = 0;
	harness.engineSoul.searchStartTime = performance.now();
	harness.engineSoul.timeLimit = 1000000;
	const startedAt = performance.now();
	const score = harness.upgrade.search(
		state,
		DEPTH,
		-harness.upgrade.MATE_SCORE,
		harness.upgrade.MATE_SCORE,
		0
	);
	const elapsedMs = performance.now() - startedAt;
	const rootEntry = harness.engineSoul.transpositionTable.get(state.zobristHash);
	return {
		score,
		bestMove: rootEntry?.move || 0,
		nodes: harness.engineSoul.nodeCount,
		elapsedMs
	};
}

/** Emits one machine-readable aggregate for before/after comparisons. */
function runBenchmark() {
	const harness = createRuntimeHarness();
	const results = [];
	for (let index = 0; index < BOOK_INDICES.length; index++) {
		const opening = harness.api.sourceBook[BOOK_INDICES[index]];
		const state = seededState(harness, opening, 4 + (index % 5));
		results.push({
			name: opening.name,
			...measurePosition(harness, state)
		});
	}
	const totals = results.reduce(
		(accumulator, result) => ({
			nodes: accumulator.nodes + result.nodes,
			elapsedMs: accumulator.elapsedMs + result.elapsedMs
		}),
		{ nodes: 0, elapsedMs: 0 }
	);
	console.log(JSON.stringify({
		depth: DEPTH,
		totals,
		nodesPerMs: totals.nodes / totals.elapsedMs,
		results
	}));
}

runBenchmark();
