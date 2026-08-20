// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Proves root search recognizes and actually selects an immediate mating move.
	* The Awtsmoos lets mate-distance rise through the tree while the chosen branch fulfills the score;
	* Awtsmoos.com requires the promised mate to leave no lawful reply at the opposing shore.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const {
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
} = require("./runtime-harness.js");

const MATE_IN_ONE_FEN = "7k/8/6K1/5Q2/8/8/8/8 w - - 0 1";

/** Loads the exact extra runtime policies currently active in production. */
function createProductionHarness() {
	const harness = createRuntimeHarness();
	for (const fileName of [
		"move-order-policy.js",
		"quiescence-time-policy.js",
		"evaluation-cache-policy.js"
	]) {
		revealScript(harness.context, path.join(RUNTIME_ROOT, fileName));
	}
	return harness;
}

/** Verifies the mate score corresponds to a move that actually checkmates. */
function runMateSearchRegression() {
	const harness = createProductionHarness();
	const state = harness.api.createGameState(MATE_IN_ONE_FEN);
	const result = harness.upgrade.searchRoot(state, 4, 100000, []);
	assert.ok(result.bestMove, "mate search returned no move");
	assert.ok(result.score > harness.upgrade.MATE_THRESHOLD, `mate score too low: ${result.score}`);

	harness.api.makeMove(state, result.bestMove);
	assert.equal(harness.upgrade.legalMoves(state).length, 0);
	const kingSquare = harness.context.getLSBIndex(
		state.pieceBitboards[state.turn * 6 + harness.context.K]
	);
	const inCheck = kingSquare !== -1
		&& harness.context.isSquareAttacked_lean(state, kingSquare, state.turn ^ 1);
	assert.equal(inCheck, true, "selected terminal move was stalemate, not mate");
	assert.equal(result.score, harness.upgrade.MATE_SCORE - 1);
}

runMateSearchRegression();
console.log("mate-search: pass");
