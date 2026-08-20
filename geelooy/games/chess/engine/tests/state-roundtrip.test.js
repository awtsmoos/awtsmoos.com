// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Proves make/unmake restores every mutable game-state field across special moves.
	* The Awtsmoos lets a branch unfold and then withdraw without stealing one grain from before;
	* Awtsmoos.com checks bitboards, rights, turns, en-passant, occupancy, and hash at the restored shore.
	*/

const assert = require("node:assert/strict");
const { createRuntimeHarness } = require("./runtime-harness.js");

/** Converts algebraic square text into the engine's a8=0 square index. */
function squareIndex(squareName) {
	const file = squareName.charCodeAt(0) - 97;
	const rank = Number(squareName[1]);
	return (8 - rank) * 8 + file;
}

/** Captures every mutable field owned by one game state in comparison-safe form. */
function snapshotState(state) {
	return {
		pieceBitboards: state.pieceBitboards.map(String),
		occupancies: state.occupancies.map(String),
		turn: state.turn,
		enpassant: state.enpassant,
		castling: state.castling,
		zobristHash: String(state.zobristHash)
	};
}

/** Finds one legal move by coordinates and optional promotion requirement. */
function findMove(harness, state, fromName, toName, requirePromotion = false) {
	const from = squareIndex(fromName);
	const to = squareIndex(toName);
	return harness.upgrade.legalMoves(state).find((move) => {
		const coordinatesMatch = harness.api.getMoveFrom(move) === from
			&& harness.api.getMoveTo(move) === to;
		const promotionMatches = !requirePromotion || harness.api.getMovePromoted(move) !== 0;
		return coordinatesMatch && promotionMatches;
	});
}

/** Makes and unmakes one special move, requiring exact restoration. */
function assertRoundTrip(harness, fen, fromName, toName, requirePromotion = false) {
	const state = harness.api.createGameState(fen);
	const before = snapshotState(state);
	const move = findMove(harness, state, fromName, toName, requirePromotion);
	assert.notEqual(move, undefined, `${fromName}${toName} must exist in ${fen}`);
	harness.api.makeMove(state, move);
	harness.api.unmakeMove(state);
	assert.deepEqual(snapshotState(state), before, `${fromName}${toName} did not restore state`);
}

/** Exercises ordinary and special move paths through the same make/unmake machinery. */
function runRoundTripRegression() {
	const harness = createRuntimeHarness();
	assertRoundTrip(
		harness,
		"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
		"e2",
		"e4"
	);
	assertRoundTrip(harness, "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1", "e1", "g1");
	assertRoundTrip(harness, "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1", "e5", "d6");
	assertRoundTrip(harness, "4k3/P7/8/8/8/8/8/4K3 w - - 0 1", "a7", "a8", true);
}

runRoundTripRegression();
console.log("state-roundtrip: pass");
