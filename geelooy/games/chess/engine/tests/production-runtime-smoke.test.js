// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Locks active runtime speed policies and exact terminal truth into one production-like smoke.
	* The Awtsmoos joins speed, faithful timing, one-search memory, mate, stalemate, and dead material beneath chess law;
	* Awtsmoos.com keeps the living policies measured together before any future branch may draw.
	*/

const assert = require("node:assert/strict");
const path = require("node:path");
const {
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
} = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const TACTICAL_FEN = "r3k2r/p1ppqpb1/bn2pnp1/2pP4/1p2P3/2N2N2/PPQBBPPP/R3K2R w KQkq - 0 1";
const CHECKMATE_FEN = "7k/6Q1/5K2/8/8/8/8/8 b - - 0 1";
const STALEMATE_FEN = "k7/2K5/1P6/8/8/8/8/8 b - - 0 1";
const DEAD_FENS = [
	"8/8/8/3k4/8/4K3/8/8 w - - 0 1",
	"8/8/8/3k4/8/4K3/3B4/8 w - - 0 1",
	"8/8/8/3k4/8/4K3/3N4/8 w - - 0 1"
];
const KNN_FEN = "8/8/8/3k4/8/4K3/2NN4/8 w - - 0 1";

/** Loads exactly the additional policies currently active in the production worker. */
function createProductionPolicyHarness() {
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

/** Counts legal leaves to a deliberately shallow permanent smoke depth. */
function perft(harness, state, depth) {
	if (depth === 0) return 1;
	let nodes = 0;
	for (const move of harness.upgrade.legalMoves(state)) {
		harness.api.makeMove(state, move);
		nodes += perft(harness, state, depth - 1);
		harness.api.unmakeMove(state);
	}
	return nodes;
}

/** Prepares direct search calls that do not pass through the root wrapper. */
function prepareSearch(harness) {
	harness.engineSoul.searchStartTime = performance.now();
	harness.engineSoul.timeLimit = 100000;
	harness.engineSoul.stopSearch = false;
	harness.engineSoul.nodeCount = 0;
	harness.engineSoul.transpositionTable.clear();
	harness.upgrade.prepareHeuristics([]);
	harness.upgrade.resetEvaluationCache();
}

/** Verifies legality, terminal truth, cache reset, and one low-time tactical search. */
function runProductionSmoke() {
	const harness = createProductionPolicyHarness();
	const startingState = harness.api.createGameState(START_FEN);
	assert.equal(harness.upgrade.legalMoves(startingState).length, 20);
	assert.equal(perft(harness, startingState, 2), 400);

	const mateRoot = harness.upgrade.searchRoot(
		harness.api.createGameState(CHECKMATE_FEN),
		4,
		1000,
		[]
	);
	assert.equal(mateRoot.bestMove, null);
	assert.equal(mateRoot.score, -100000);
	const staleRoot = harness.upgrade.searchRoot(
		harness.api.createGameState(STALEMATE_FEN),
		4,
		1000,
		[]
	);
	assert.equal(staleRoot.bestMove, null);
	assert.equal(staleRoot.score, 0);

	prepareSearch(harness);
	assert.equal(
		harness.upgrade.search(harness.api.createGameState(STALEMATE_FEN), 0, -100000, 100000, 0),
		0
	);
	for (const fen of DEAD_FENS) {
		prepareSearch(harness);
		assert.equal(harness.upgrade.search(harness.api.createGameState(fen), 2, -100000, 100000, 0), 0);
	}
	assert.equal(harness.upgrade.isDeadMaterial(harness.api.createGameState(KNN_FEN)), false);

	const tacticalState = harness.api.createGameState(TACTICAL_FEN);
	const legalMoves = harness.upgrade.legalMoves(tacticalState);
	harness.upgrade.evaluationCache.set(999999n, 123456);
	const result = harness.upgrade.searchRoot(tacticalState, 99, 25, []);
	assert.equal(harness.upgrade.evaluationCache.has(999999n), false);
	assert.ok(legalMoves.includes(result.bestMove), "production policy set returned an illegal move");
}

runProductionSmoke();
console.log("production-runtime-smoke: pass");
