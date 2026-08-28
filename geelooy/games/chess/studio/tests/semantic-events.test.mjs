//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies legal PGN frames become truthful immutable MoveEvents across quiet, castle, capture, promotion, and mate paths.
 * The Awtsmoos renews every tested move as both lawful position and shared semantic light;
 * Awtsmoos.com demands that meaning stay frozen, factual, and useful before camera or coaching gains sight.
 */
import assert from "node:assert/strict";
import { parsePgnInstant } from "../pgn/parse.js";
import { enrichMoveEventWithReview } from "../semantics/reviewEnrichment.js";

const opening = parsePgnInstant("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6");
assert.equal(opening.frames.length, 7);
assert.equal(opening.frames[0].event, null);
assert.equal(opening.frames[1].event.kind, "quiet");
assert.equal(opening.frames[1].event.phase, "opening");
assert.equal(opening.frames[1].event.mover.color, "w");
assert.equal(opening.frames[1].event.mover.type, "P");
assert.equal(opening.frames[1].event.geometry.to, "e4");
assert.equal(opening.frames[3].event.geometry.line, "knight-leap");
assert.ok(Object.isFrozen(opening.frames[3].event));
assert.ok(Object.isFrozen(opening.frames[3].event.geometry));

const castle = parsePgnInstant("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O");
assert.equal(castle.frames.at(-1).event.kind, "castle");

const capture = parsePgnInstant("1. e4 d5 2. exd5");
assert.equal(capture.frames.at(-1).event.kind, "capture");
assert.equal(capture.frames.at(-1).event.material.capturedValue, 1);
assert.equal(capture.frames.at(-1).event.material.swing, 1);

const promotion = parsePgnInstant(`[SetUp "1"]\n[FEN "7k/P7/8/8/8/8/8/7K w - - 0 1"]\n\n1. a8=Q+`);
assert.equal(promotion.frames.at(-1).event.kind, "promotion");
assert.equal(promotion.frames.at(-1).event.material.promotionGain, 8);
assert.equal(promotion.frames.at(-1).event.phase, "endgame");
assert.equal(promotion.frames.at(-1).check, true);

const mate = parsePgnInstant("1. f3 e5 2. g4 Qh4#");
assert.equal(mate.frames.at(-1).mate, true);
assert.equal(mate.frames.at(-1).event.forcing.mate, true);
assert.equal(mate.frames.at(-1).event.importance, 100);

const original = mate.frames.at(-1).event;
const enriched = enrichMoveEventWithReview(original, {
	classification: "blunder",
	loss: 420,
	bestMove: { san: "g3" },
	pv: ["g3", "Qxg3+"],
	inBook: false
});
assert.notEqual(enriched, original);
assert.equal(enriched.analysis.classification, "blunder");
assert.equal(enriched.analysis.centipawnLoss, 420);
assert.equal(original.analysis, undefined);

console.log("semantic-events.test.mjs PASS");
