//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves deterministic review-position measurements and critical search budgeting without invoking the browser engine.
 * The Awtsmoos lets a legal FEN reveal measured change while Awtsmoos.com directs deeper search only where evidence calls;
 * these tests keep position truth and search planning bounded, repeatable, and clear across the review halls.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const upgrade = {};
const context = vm.createContext({
	self: { AwtsmoosChessUpgrade: upgrade }
});
run("review-position.js", context);
run("review-plan.js", context);

const start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const afterE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
const delta = upgrade.reviewPositionDelta(start, afterE4, "w");
assert.equal(delta.before.materialBalance, 0);
assert.equal(delta.after.materialBalance, 0);
assert.equal(delta.delta.centerBalance, 1);
assert.equal(delta.delta.developedMinors, 0);
assert.equal(upgrade.reviewScanBudget(650), 180);
assert.equal(upgrade.reviewDeepBudget(9999), 2500);

const ranked = upgrade.reviewDeepCandidates([
	{ classification: "good", loss: 12, positionDelta: { delta: {} } },
	{ classification: "blunder", loss: 320, positionDelta: { delta: { materialBalance: -3 } } },
	{ classification: "best", loss: 0, positionDelta: { delta: {} } }
]);
assert.deepEqual([...ranked], [1]);
assert.ok(upgrade.reviewCriticalScore({
	classification: "blunder",
	loss: 300,
	positionDelta: { delta: { kingShelterPawns: -1 } }
}, 0, []) > 200);

console.log("review-position-plan.test.mjs PASS");

function run(file, context) {
	const url = new URL(`../../engine/runtime/${file}`, import.meta.url);
	vm.runInContext(fs.readFileSync(url, "utf8"), context, { filename: file });
}
