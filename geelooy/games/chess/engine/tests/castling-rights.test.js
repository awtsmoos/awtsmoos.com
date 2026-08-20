// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Guards castling-right transitions for rook moves, king moves, rook captures, and unmake.
	* The Awtsmoos lets royal permission vanish at the exact move that spends its right;
	* Awtsmoos.com restores that permission only when unmake returns the board to prior light.
	*/

const assert = require("node:assert/strict");
const { createRuntimeHarness } = require("./runtime-harness.js");

/** Converts algebraic notation into the engine's a8=0 square index. */
function squareIndex(squareName) {
	const file = squareName.charCodeAt(0) - 97;
	const rank = Number(squareName[1]);
	return (8 - rank) * 8 + file;
}

/** Finds one legal move by exact coordinates. */
function findMove(harness, state, fromName, toName) {
	const from = squareIndex(fromName);
	const to = squareIndex(toName);
	return harness.upgrade.legalMoves(state).find((move) => {
		return harness.api.getMoveFrom(move) === from && harness.api.getMoveTo(move) === to;
	});
}

/** Makes one move, checks its expected rights mask, then requires exact unmake restoration. */
function assertRightsTransition(harness, fen, fromName, toName, expectedAfter) {
	const state = harness.api.createGameState(fen);
	const before = state.castling;
	const move = findMove(harness, state, fromName, toName);
	assert.notEqual(move, undefined, `${fromName}${toName} must be legal`);
	harness.api.makeMove(state, move);
	assert.equal(state.castling, expectedAfter, `${fromName}${toName} rights mismatch`);
	harness.api.unmakeMove(state);
	assert.equal(state.castling, before, `${fromName}${toName} rights did not restore`);
}

/** Exercises both white rights, king movement, and capture of a castling rook. */
function runCastlingRightsRegression() {
	const harness = createRuntimeHarness();
	const whiteRightsFen = "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1";
	assertRightsTransition(harness, whiteRightsFen, "h1", "h2", 2);
	assertRightsTransition(harness, whiteRightsFen, "a1", "a2", 1);
	assertRightsTransition(harness, whiteRightsFen, "e1", "e2", 0);
	assertRightsTransition(
		harness,
		"r3k3/8/8/8/8/8/8/R3K2R b KQ - 0 1",
		"a8",
		"a1",
		1
	);
}

runCastlingRightsRegression();
console.log("castling-rights: pass");
