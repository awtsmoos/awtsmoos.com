//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves cautionary punishment lines remain useful authored evidence without becoming opening-book approval.
 * The Awtsmoos lets warning and theory share one library while Awtsmoos.com preserves the difference in kind;
 * a trap-study match may illuminate the danger, but only genuine opening candidates can mark a move book-aligned.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const upgrade = {};
const context = vm.createContext({
	self: { AwtsmoosChessUpgrade: upgrade },
	sourceBook: [{ name: "King Pawn", pgn: "1. e4 e5 2. Nf3 Nc6" }],
	punishmentBookSource: [{ name: "Beginner Blunder: Fool's Mate", pgn: "1. f3 e5 2. g4 Qh4#" }]
});
run("review-pgn.js", context);
run("review-book.js", context);

const warning = upgrade.reviewBookForSequence(["f3", "e5", "g4"]);
const warningEvidence = upgrade.reviewBookEvidence(warning);
assert.equal(warning.openingCandidates, 0);
assert.equal(warning.punishmentCandidates, 1);
assert.equal(warning.kind, "punishment");
assert.equal(warningEvidence.inBook, false);

const theory = upgrade.reviewBookForSequence(["e4", "e5"]);
const theoryEvidence = upgrade.reviewBookEvidence(theory);
assert.equal(theory.openingCandidates, 1);
assert.equal(theory.punishmentCandidates, 0);
assert.equal(theoryEvidence.inBook, true);

console.log("review-book-kind.test.mjs PASS");

function run(file, context) {
	const url = new URL(`../../engine/runtime/${file}`, import.meta.url);
	vm.runInContext(fs.readFileSync(url, "utf8"), context, { filename: file });
}
