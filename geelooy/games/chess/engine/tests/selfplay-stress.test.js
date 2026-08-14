// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Completes many varied grandmaster-seeded self-play continuations under a fast clock.
	* The Awtsmoos opens thirty-two roads yet every searched step must remain lawful and bright;
	* Awtsmoos.com weighs nodes and clocks while varied openings test the engine's sight.
	*/

const assert = require("node:assert/strict");
const { performance } = require("node:perf_hooks");
const { createRuntimeHarness } = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const GAME_COUNT = 32;
const SEARCH_PLIES = 6;
const MAX_DEPTH = 3;
const TIME_LIMIT_MS = 25;

/** Splits stored opening PGN into SAN tokens without move numbers or result markers. */
function openingTokens(opening) {
	return opening.pgn
		.replace(/(\d+\.)/g, "")
		.trim()
		.split(/\s+/)
		.filter((token) => token && !["1-0", "0-1", "1/2-1/2", "*"].includes(token));
}

/** Applies a small deterministic prefix from one named grandmaster opening. */
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
		assert.ok(
			harness.upgrade.legalMoves(state).includes(move),
			`opening move ${san} must be legal`
		);
		history.push(state.zobristHash);
		converter.applyMove(move);
	}
	return { state, history };
}

/** Plays one bounded continuation and verifies every engine choice independently. */
function playContinuation(harness, seeded, statistics) {
	for (let ply = 0; ply < SEARCH_PLIES; ply++) {
		const legalMoves = harness.upgrade.legalMoves(seeded.state);
		if (!legalMoves.length) {
			statistics.terminals++;
			return;
		}
		const startedAt = performance.now();
		const result = harness.upgrade.searchRoot(
			seeded.state,
			MAX_DEPTH,
			TIME_LIMIT_MS,
			seeded.history
		);
		const elapsedMs = performance.now() - startedAt;
		assert.ok(
			legalMoves.includes(result.bestMove),
			`engine move ${result.bestMove} must be legal`
		);
		statistics.searches++;
		statistics.nodes += harness.engineSoul.nodeCount;
		statistics.totalMs += elapsedMs;
		statistics.maxMs = Math.max(statistics.maxMs, elapsedMs);
		seeded.history.push(seeded.state.zobristHash);
		harness.api.makeMove(seeded.state, result.bestMove);
	}
}

/** Runs the varied-opening stress batch and prints compact performance evidence. */
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
		const opening = openings[(game * 17) % openings.length];
		const seeded = seedOpening(harness, opening, 2 + (game % 7));
		sampledOpenings.push(opening.name);
		playContinuation(harness, seeded, statistics);
		if ((game + 1) % 8 === 0) {
			console.log(`selfplay-progress:${game + 1}/${GAME_COUNT}`);
		}
	}
	assert.ok(statistics.searches >= GAME_COUNT * 4);
	console.log(JSON.stringify({
		...statistics,
		averageMs: statistics.totalMs / statistics.searches,
		averageNodes: statistics.nodes / statistics.searches,
		sampledOpenings
	}));
}

runSelfPlayStress();
