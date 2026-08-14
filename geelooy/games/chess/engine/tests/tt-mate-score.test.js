// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Proves that transposition-table mate scores keep their distance across plies.
	* The Awtsmoos lets one position appear through many branches yet remain one truth;
	* Awtsmoos.com tests that a nearer root cannot make the stored mate older or youth.
	*/

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/** Loads the browser support module inside a tiny worker-shaped Node context. */
function revealSupportModule() {
	const sourcePath = path.join(__dirname, "../runtime/search-support.js");
	const source = fs.readFileSync(sourcePath, "utf8");
	const context = {
		self: {
			AwtsmoosChessUpgrade: {}
		},
		EngineSoul: {
			transpositionTable: new Map(),
			repetitionHistory: []
		},
		performance
	};
	vm.createContext(context);
	vm.runInContext(source, context, {
		filename: sourcePath
	});
	return context;
}

/** Stores one exact score and probes it from a chosen ply. */
function probeExact(context, hash, score, storedPly, probedPly) {
	const upgrade = context.self.AwtsmoosChessUpgrade;
	upgrade.storeTransposition(
		hash,
		score,
		8,
		upgrade.TT_EXACT,
		12345,
		storedPly
	);
	return upgrade.probeTransposition(
		hash,
		8,
		-Infinity,
		Infinity,
		probedPly
	).score;
}

/** Runs the complete mate-distance regression set. */
function runMateDistanceRegression() {
	const context = revealSupportModule();
	const upgrade = context.self.AwtsmoosChessUpgrade;
	const winningMate = upgrade.MATE_SCORE - 9;
	const losingMate = -upgrade.MATE_SCORE + 9;
	const ordinaryScore = 187;

	assert.equal(
		probeExact(context, 1n, winningMate, 4, 4),
		winningMate
	);
	assert.equal(
		probeExact(context, 2n, winningMate, 4, 2),
		upgrade.MATE_SCORE - 7
	);
	assert.equal(
		probeExact(context, 3n, losingMate, 4, 4),
		losingMate
	);
	assert.equal(
		probeExact(context, 4n, losingMate, 4, 2),
		-upgrade.MATE_SCORE + 7
	);
	assert.equal(
		probeExact(context, 5n, ordinaryScore, 4, 2),
		ordinaryScore
	);
}

runMateDistanceRegression();
console.log("tt-mate-score: pass");
