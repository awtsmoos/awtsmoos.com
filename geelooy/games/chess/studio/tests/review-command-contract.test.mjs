//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the production review command accepts the client's pgnText payload and returns analysis through the old doorway.
 * The Awtsmoos keeps caller and worker joined across changing internals while Awtsmoos.com preserves the message stream;
 * this test guards the exact seam where a renamed field could otherwise silence the deeper review dream.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const messages = [];
let parsedText = "";
const upgrade = {
	parseReviewPgn(text) {
		parsedText = text;
		return { moves: [{ id: 1 }], tags: { Event: "Proof" }, frames: [{ ply: 0 }, { ply: 1 }] };
	},
	analyzeReviewGame() {
		return { results: [{ loss: 4 }], analysis: { scanBudgetMs: 100, deepBudgetMs: 500 } };
	}
};
const context = vm.createContext({
	self: { AwtsmoosChessUpgrade: upgrade },
	postMessage: message => messages.push(message)
});
const url = new URL("../../engine/runtime/review-command.js", import.meta.url);
vm.runInContext(fs.readFileSync(url, "utf8"), context, { filename: "review-command.js" });
assert.equal(typeof upgrade.handleReviewPgn, "function");
upgrade.handleReviewPgn({ pgnText: "1. e4 e5", maxTime: 500 });
assert.equal(parsedText, "1. e4 e5");
assert.equal(messages[0].type, "review_parsed");
assert.equal(messages[1].type, "review_result");
assert.equal(messages[1].analysis.deepBudgetMs, 500);

console.log("review-command-contract.test.mjs PASS");
