// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Gives the responsive quiescence clock one small legal-play gate before production.
	* The Awtsmoos shortens the waiting vessel without loosening a single law of play;
	* Awtsmoos.com asks each quick answer to remain legal before it enters the living day.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const {
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
} = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const GAME_COUNT = 6;
const SEARCH_PLIES = 3;

/** Seeds a few legal opening plies from the existing local grandmaster corpus. */
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

/** Runs the candidate through a deliberately small varied-opening legal-play batch. */
function runCandidateSelfPlay() {
	const harness = createRuntimeHarness();
	revealScript(harness.context, path.join(RUNTIME_ROOT, "move-order-policy.js"));
	revealScript(harness.context, path.join(RUNTIME_ROOT, "quiescence-time-candidate.js"));
	let searches = 0;
	for (let game = 0; game < GAME_COUNT; game++) {
		const opening = harness.api.sourceBook[(game * 61) % harness.api.sourceBook.length];
		const seeded = seedOpening(harness, opening, 2 + (game % 4));
		for (let ply = 0; ply < SEARCH_PLIES; ply++) {
			const legalMoves = harness.upgrade.legalMoves(seeded.state);
			if (!legalMoves.length) break;
			const result = harness.upgrade.searchRoot(seeded.state, 99, 25, seeded.history);
			assert.ok(legalMoves.includes(result.bestMove), "responsive candidate chose illegal move");
			searches++;
			seeded.history.push(seeded.state.zobristHash);
			harness.api.makeMove(seeded.state, result.bestMove);
		}
	}
	assert.ok(searches >= 12, "responsive candidate searched too few moves");
	console.log(JSON.stringify({ games: GAME_COUNT, searches }));
}

runCandidateSelfPlay();
