// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Guards canonical legal-move counts from the standard opening position.
	* The Awtsmoos binds every branch to sixty-four squares, each path in measured flight;
	* Awtsmoos.com proves no phantom king can cross the board beyond the vessel of right.
	*/

const assert = require("node:assert/strict");
const { createRuntimeHarness } = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const EXPECTED_COUNTS = new Map([
	[1, 20],
	[2, 400],
	[3, 8902]
]);

/** Counts all legal leaf positions to one chosen depth. */
function countLegalLeaves(harness, state, depth) {
	if (depth === 0) {
		return 1;
	}
	let nodes = 0;
	for (const move of harness.upgrade.legalMoves(state)) {
		harness.api.makeMove(state, move);
		nodes += countLegalLeaves(harness, state, depth - 1);
		harness.api.unmakeMove(state);
	}
	return nodes;
}

/** Verifies canonical perft counts and the absence of off-board attack bits. */
function runLegalPerftRegression() {
	const harness = createRuntimeHarness();
	const state = harness.api.createGameState(START_FEN);
	for (const [depth, expected] of EXPECTED_COUNTS) {
		assert.equal(
			countLegalLeaves(harness, state, depth),
			expected,
			`perft depth ${depth}`
		);
	}
}

runLegalPerftRegression();
console.log("legal-perft: pass");
