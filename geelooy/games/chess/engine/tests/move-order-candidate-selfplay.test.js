// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Stress-checks the move-order candidate in isolation before production activation.
	* The Awtsmoos lets faster branches prove their lawfulness before entering the living gate;
	* Awtsmoos.com keeps production still while candidate play earns the right to participate.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const {
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
} = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const GAME_COUNT = 8;
const SEARCH_PLIES = 4;

/** Seeds one short deterministic opening prefix from the local grandmaster corpus. */
function seedOpening(harness, opening, requestedPlies) {
	const state = harness.api.createGameState(START_FEN);
	const converter = new harness.api.PgnConverter();
	const history = [];
	converter.setState(state);
	const tokens = opening.pgn
		.replace(/(\d+\.)/g, "")
		.trim()
		.split(/\s+/)
		.filter((token) => token && !["1-0", "0-1", "1/2-1/2", "*"].includes(token));
	for (const san of tokens.slice(0, requestedPlies)) {
		const move = converter.parseSan(san);
		if (move === null) break;
		assert.ok(harness.upgrade.legalMoves(state).includes(move));
		history.push(state.zobristHash);
		converter.applyMove(move);
	}
	return { state, history };
}

/** Runs a small candidate-only legal self-play batch. */
function runCandidateSelfPlay() {
	const harness = createRuntimeHarness();
	revealScript(harness.context, path.join(RUNTIME_ROOT, "move-order-policy.js"));
	let searches = 0;
	let nodes = 0;
	for (let game = 0; game < GAME_COUNT; game++) {
		const opening = harness.api.sourceBook[(game * 41) % harness.api.sourceBook.length];
		const seeded = seedOpening(harness, opening, 2 + (game % 5));
		for (let ply = 0; ply < SEARCH_PLIES; ply++) {
			const legalMoves = harness.upgrade.legalMoves(seeded.state);
			if (!legalMoves.length) break;
			const result = harness.upgrade.searchRoot(
				seeded.state,
				3,
				25,
				seeded.history
			);
			assert.ok(legalMoves.includes(result.bestMove), "candidate chose an illegal move");
			searches++;
			nodes += harness.engineSoul.nodeCount;
			seeded.history.push(seeded.state.zobristHash);
			harness.api.makeMove(seeded.state, result.bestMove);
		}
	}
	assert.ok(searches >= 24, "candidate self-play searched too few moves");
	console.log(JSON.stringify({ games: GAME_COUNT, searches, nodes }));
}

runCandidateSelfPlay();
