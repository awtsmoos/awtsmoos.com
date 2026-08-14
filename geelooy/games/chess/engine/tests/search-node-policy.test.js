// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Proves forcing promotions never masquerade as reducible quiet moves.
	* The Awtsmoos crowns a pawn with force that reduction must never hide;
	* Awtsmoos.com keeps king-law and terminal truth beside the searcher's stride.
	*/

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/** Loads node policy with tiny move and attack adapters. */
function revealNodePolicy() {
	const sourcePath = path.join(__dirname, "../runtime/search-node-policy.js");
	const source = fs.readFileSync(sourcePath, "utf8");
	const context = {
		self: {
			AwtsmoosChessUpgrade: {
				MATE_SCORE: 100000
			}
		},
		K: 5,
		getMoveCapture: (move) => move.capture,
		getMovePromoted: (move) => move.promoted,
		getLSBIndex: () => 12,
		isSquareAttacked_lean: (state) => state.attacked
	};
	vm.createContext(context);
	vm.runInContext(source, context, {
		filename: sourcePath
	});
	return context.self.AwtsmoosChessUpgrade;
}

/** Exercises quiet classification and terminal node scoring. */
function runNodePolicyRegression() {
	const policy = revealNodePolicy();
	assert.equal(
		policy.isReducibleQuietMove({ capture: 0, promoted: 0 }),
		true
	);
	assert.equal(
		policy.isReducibleQuietMove({ capture: 1, promoted: 0 }),
		false
	);
	assert.equal(
		policy.isReducibleQuietMove({ capture: 0, promoted: 4 }),
		false
	);
	assert.equal(
		policy.isReducibleQuietMove({ capture: 1, promoted: 4 }),
		false
	);
	assert.equal(policy.isIllegalAfterMove({ turn: 0, pieceBitboards: [], attacked: false }), false);
	assert.equal(policy.isIllegalAfterMove({ turn: 0, pieceBitboards: [], attacked: true }), true);
	assert.equal(policy.terminalScore(false, 9), 0);
	assert.equal(policy.terminalScore(true, 9), -99991);
}

runNodePolicyRegression();
console.log("search-node-policy: pass");
