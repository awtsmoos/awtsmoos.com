// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Proves incremental Zobrist identity and rights-sensitive position identity.
	* The Awtsmoos names each board with one faithful sign however many branches carried it there;
	* Awtsmoos.com guards cache and TT by proving rebuilt state and legal rights remain distinct and clear.
	*/

const assert = require("node:assert/strict");
const { createRuntimeHarness } = require("./runtime-harness.js");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Serializes the current state and rebuilds it through the engine's normal FEN parser. */
function rebuiltHash(harness, state) {
	const converter = new harness.api.PgnConverter();
	converter.setState(state);
	return harness.api.createGameState(converter.toFen()).zobristHash;
}

/** Requires the incremental hash to equal a hash rebuilt from current board state. */
function assertHashIdentity(harness, state, label) {
	assert.equal(state.zobristHash, rebuiltHash(harness, state), `Zobrist mismatch at ${label}`);
}

/** Walks a deterministic legal line while rebuilding and checking the hash after every move. */
function runLongLegalLine(harness) {
	const state = harness.api.createGameState(START_FEN);
	assertHashIdentity(harness, state, "start");
	let played = 0;
	for (let ply = 0; ply < 40; ply++) {
		const legalMoves = harness.upgrade.legalMoves(state);
		if (!legalMoves.length) {
			break;
		}
		const move = legalMoves[(ply * 11 + 3) % legalMoves.length];
		harness.api.makeMove(state, move);
		played++;
		assertHashIdentity(harness, state, `ply ${played}`);
	}
	assert.ok(played >= 20, "deterministic line ended too early");
}

/** Checks special-move transitions because cache identity depends on rights and en-passant. */
function runSpecialMoveHashes(harness) {
	for (const fen of [
		"r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
		"4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1",
		"4k3/P7/8/8/8/8/8/4K3 w - - 0 1"
	]) {
		const state = harness.api.createGameState(fen);
		assertHashIdentity(harness, state, `special start ${fen}`);
		for (const move of harness.upgrade.legalMoves(state).slice(0, 8)) {
			harness.api.makeMove(state, move);
			assertHashIdentity(harness, state, `special move ${move}`);
			harness.api.unmakeMove(state);
			assertHashIdentity(harness, state, `special restore ${move}`);
		}
	}
}

/** Proves legal-state metadata that changes search identity cannot alias in the TT hash. */
function runRightsIdentityRegression(harness) {
	const hash = (fen) => harness.api.createGameState(fen).zobristHash;
	assert.notEqual(
		hash("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"),
		hash("r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1")
	);
	assert.notEqual(
		hash("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"),
		hash("r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1")
	);
	assert.notEqual(
		hash("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1"),
		hash("4k3/8/8/3pP3/8/8/8/4K3 w - - 0 1")
	);
}

function runZobristRegression() {
	const harness = createRuntimeHarness();
	runLongLegalLine(harness);
	runSpecialMoveHashes(harness);
	runRightsIdentityRegression(harness);
}

runZobristRegression();
console.log("zobrist-consistency: pass");
