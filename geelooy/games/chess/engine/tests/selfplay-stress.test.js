// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Stress-plays many varied grandmaster-seeded games through the live search runtime.
	* The Awtsmoos opens many roads yet every chosen step must remain lawful and bright;
	* Awtsmoos.com weighs nodes, clocks, crowns, and endings while the engine tests its sight.
	*/

const assert = require("node:assert/strict");
const { performance } = require("node:perf_hooks");
const { createRuntimeHarness } = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const GAME_COUNT = 24;
const SEARCH_PLIES = 14;
const MAX_DEPTH = 4;
const TIME_LIMIT_MS = 15;

/** Splits one stored opening PGN into SAN tokens without move numbers or results. */
function openingTokens(opening) {
	return opening.pgn
		.replace(/(\d+\.)/g, "")
		.trim()
		.split(/\s+/)
		.filter((token) => token && !["1-0", "0-1", "1/2-1/2", "*"].includes(token));
}

/** Seeds one state from a deterministic slice of a named grandmaster opening. */
function seedOpening(harness, opening, requestedPlies) {
	const state = harness.api.createGameState(START_FEN);
	const converter = new harness.api.PgnConverter();
	const history = [];
	converter.setState(state);
	for (const san of openingTokens(opening).slice(0, requestedPlies)) {
		const move = converter.parseSan(san);
		if (move === null) {
			break;
		}
		assert.ok(harness.upgrade.legalMoves(state).includes(move), `opening move ${san} must be legal`);
		history.push(state.zobristHash);
		converter.applyMove(move);
	}
	return {
		state,
		history
	};
}

/** Plays one bounded engine-vs-engine continuation while verifying every chosen move. */
function playContinuation(harness, state, history, statistics) {
	for (let ply = 0; ply < SEARCH_PLIES; ply++) {
		const legalMoves = harness.upgrade.legalMoves(state);
		if (!legalMoves.length) {
			statistics.terminals++;
			return;
		}
		const startedAt = performance.now();
		const result = harness.upgrade.searchRoot(
			state,
			MAX_DEPTH,
			TIME_LIMIT_MS,
			history
		);
		const elapsedMs = performance.now() - startedAt;
		assert.ok(legalMoves.includes(result.bestMove), `engine move ${result.bestMove} must be legal`);
		statistics.searches++;
		statistics.nodes += harness.engineSoul.nodeCount;
		statistics.totalMs += elapsedMs;
		statistics.maxMs = Math.max(statistics.maxMs, elapsedMs);
		history.push(state.zobristHash);
		harness.api.makeMove(state, result.bestMove);
	}
}

/** Runs the complete varied-opening self-play stress batch. */
function runSelfPlayStress() {
	const harness = createRuntimeHarness();
	const openings = harness.api.sourceBook;
	assert.ok(Array.isArray(openings) && openings.length >= GAME_COUNT);
	const statistics = {
		games: GAME_COUNT,
		searches: 0,
		terminals: 0,
		nodes: 0,
		totalMs: 0,
		maxMs: 0
	};
	const sampledOpenings = [];
	for (let game = 0; game < GAME_COUNT; game++) {
		const opening = openings[(game * 23) % openings.length];
		const seedPlies = 2 + (game % 7);
		const seeded = seedOpening(harness, opening, seedPlies);
		sampledOpenings.push(opening.name);
		playContinuation(harness, seeded.state, seeded.history, statistics);
	}
	assert.ok(statistics.searches >= GAME_COUNT * 8, "stress batch should search substantial play");
	console.log(JSON.stringify({
		...statistics,
		averageMs: statistics.totalMs / statistics.searches,
		averageNodes: statistics.nodes / statistics.searches,
		sampledOpenings
	}));
}

runSelfPlayStress();
