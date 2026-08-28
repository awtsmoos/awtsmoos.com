//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves two-pass review ordering, progress phases, deep replacement, and complete scan-plus-deep work accounting.
 * The Awtsmoos lets the first beam touch every move and the deeper beam revisit only the chosen place;
 * Awtsmoos.com counts both journeys honestly so performance evidence never disappears without a trace.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const messages = [];
const upgrade = {
	reviewScanBudget: () => 100,
	reviewDeepBudget: () => 500,
	reviewDeepCandidates: () => [1],
	reviewCriticalScore: result => result.loss,
	analyzeReviewMove(move, options) {
		const deep = options.searchPass === "deep";
		return Object.freeze({
			id: move.id,
			loss: deep ? 55 : move.loss,
			nodes: deep ? 100 : 10,
			elapsedMs: deep ? 40 : 4,
			searchPass: options.searchPass
		});
	}
};
const context = vm.createContext({
	self: { AwtsmoosChessUpgrade: upgrade },
	postMessage: message => messages.push(message)
});
const url = new URL("../../engine/runtime/review-analysis.js", import.meta.url);
vm.runInContext(fs.readFileSync(url, "utf8"), context, { filename: "review-analysis.js" });
const outcome = upgrade.analyzeReviewGame({
	moves: [{ id: 0, loss: 5 }, { id: 1, loss: 80 }, { id: 2, loss: 6 }]
}, { maxTime: 500 });

assert.deepEqual([...outcome.analysis.deepenedPlies], [2]);
assert.equal(outcome.results[1].searchPass, "deep");
assert.equal(outcome.results[1].scanNodes, 10);
assert.equal(outcome.analysis.totalNodes, 130);
assert.equal(outcome.analysis.totalElapsedMs, 52);
assert.equal(messages.filter(message => message.phase === "scan").length, 3);
assert.equal(messages.filter(message => message.phase === "deep").length, 1);
assert.equal(outcome.results[1].criticalScore, 55);

console.log("review-analysis.test.mjs PASS");
