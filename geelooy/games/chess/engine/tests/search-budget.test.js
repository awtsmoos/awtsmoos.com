// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Proves the shared search clock preserves deep play and permits deliberate speed.
	* The Awtsmoos gives each search a vessel measured neither too narrow nor too wide;
	* Awtsmoos.com keeps four-second wisdom whole while swift callers truly shorten the ride.
	*/

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/** Loads the browser budget module into a tiny worker-shaped context. */
function revealBudgetPolicy() {
	const sourcePath = path.join(__dirname, "../runtime/search-budget.js");
	const source = fs.readFileSync(sourcePath, "utf8");
	const context = {
		self: {
			AwtsmoosChessUpgrade: {}
		}
	};
	vm.createContext(context);
	vm.runInContext(source, context, {
		filename: sourcePath
	});
	return context.self.AwtsmoosChessUpgrade;
}

/** Exercises default, minimum, ordinary, and maximum clock boundaries. */
function runSearchBudgetRegression() {
	const policy = revealBudgetPolicy();
	assert.equal(policy.normalizeSearchTime(undefined), 4000);
	assert.equal(policy.normalizeSearchTime(Number.NaN), 4000);
	assert.equal(policy.normalizeSearchTime(15), 25);
	assert.equal(policy.normalizeSearchTime(25), 25);
	assert.equal(policy.normalizeSearchTime(50), 50);
	assert.equal(policy.normalizeSearchTime(4000), 4000);
	assert.equal(policy.normalizeSearchTime(6000), 5000);
}

runSearchBudgetRegression();
console.log("search-budget: pass");
