// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Guards mate, pinned en-passant, castling-through-check, and promotion legality.
	* The Awtsmoos gives every special move its exact boundary, neither phantom permission nor hidden ban;
	* Awtsmoos.com proves king-safety and promotion choice before search begins its plan.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const {
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
} = require("./runtime-harness.js");

/** Converts algebraic notation into the engine's a8=0 square index. */
function squareIndex(squareName) {
	const file = squareName.charCodeAt(0) - 97;
	const rank = Number(squareName[1]);
	return (8 - rank) * 8 + file;
}

/** Loads the exact extra policies currently active in production. */
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

/** Finds legal moves between two named squares. */
function movesBetween(harness, state, fromName, toName) {
	const from = squareIndex(fromName);
	const to = squareIndex(toName);
	return harness.upgrade.legalMoves(state).filter((move) => {
		return harness.api.getMoveFrom(move) === from && harness.api.getMoveTo(move) === to;
	});
}

/** Exercises special legality paths and horizon mate scoring. */
function runSpecialLegalityRegression() {
	const harness = createProductionHarness();

	const mate = harness.api.createGameState("7k/6Q1/5K2/8/8/8/8/8 b - - 0 1");
	assert.equal(harness.upgrade.legalMoves(mate).length, 0);
	harness.engineSoul.searchStartTime = performance.now();
	harness.engineSoul.timeLimit = 100000;
	harness.engineSoul.stopSearch = false;
	harness.engineSoul.nodeCount = 0;
	harness.upgrade.prepareHeuristics([]);
	assert.equal(harness.upgrade.search(mate, 0, -100000, 100000, 0), -100000);

	const enPassant = harness.api.createGameState("k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1");
	assert.equal(movesBetween(harness, enPassant, "e5", "d6").length, 0);

	const castling = harness.api.createGameState("4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1");
	assert.equal(movesBetween(harness, castling, "e1", "g1").length, 0);
	assert.equal(movesBetween(harness, castling, "e1", "c1").length, 1);

	const promotion = harness.api.createGameState("4k3/P7/8/8/8/8/8/4K3 w - - 0 1");
	const promotionMoves = movesBetween(harness, promotion, "a7", "a8");
	assert.equal(promotionMoves.length, 4);
	assert.equal(new Set(promotionMoves.map(harness.api.getMovePromoted)).size, 4);
}

runSpecialLegalityRegression();
console.log("special-legality: pass");
