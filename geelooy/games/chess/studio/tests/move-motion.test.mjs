//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies pure legal move motion for glide, knight arc, capture, en-passant, castling, promotion, and movie progress.
 * The Awtsmoos lets every tested traveler cross a measured path while legal endpoints remain untouched and true;
 * Awtsmoos.com proves cinema may animate the move without inventing a board the chess rules never knew.
 */
import assert from "node:assert/strict";
import { createMovieTimeline, iterateMovieFrames } from "../cinema/movieTimeline.js";
import { parsePgnInstant } from "../pgn/parse.js";
import { createMoveMotion, withMoveMotionProgress } from "../rendering/motion/moveMotion.js";

const quietReplay = parsePgnInstant("1. e4 e5 2. Nf3");
const e4 = createMoveMotion(quietReplay.frames[0], quietReplay.frames[1]);
assert.equal(e4.kind, "quiet");
assert.equal(e4.from, 52);
assert.equal(e4.to, 36);
assert.equal(withMoveMotionProgress(e4, 0).travel, 0);
assert.equal(withMoveMotionProgress(e4, 1).travel, 1);
assert.ok(withMoveMotionProgress(e4, 0.5).arc > 0);

const knight = createMoveMotion(quietReplay.frames[2], quietReplay.frames[3]);
assert.ok(withMoveMotionProgress(knight, 0.5).arc > withMoveMotionProgress(e4, 0.5).arc);

const captureReplay = parsePgnInstant("1. e4 d5 2. exd5");
const capture = createMoveMotion(captureReplay.frames[2], captureReplay.frames[3]);
assert.equal(capture.kind, "capture");
assert.equal(capture.captureSquare, capture.to);
assert.equal(withMoveMotionProgress(capture, 0.4).captureVisible, true);
assert.equal(withMoveMotionProgress(capture, 0.7).captureVisible, false);

const enPassantReplay = parsePgnInstant(`[SetUp "1"]\n[FEN "7k/8/8/3pP3/8/8/8/7K w - d6 0 1"]\n\n1. exd6`);
const enPassant = createMoveMotion(enPassantReplay.frames[0], enPassantReplay.frames[1]);
assert.equal(enPassant.kind, "en-passant");
assert.notEqual(enPassant.captureSquare, enPassant.to);

const castleReplay = parsePgnInstant("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O");
const castle = createMoveMotion(castleReplay.frames.at(-2), castleReplay.frames.at(-1));
assert.equal(castle.kind, "castle");
assert.deepEqual(castle.castleRook, { from: 63, to: 61, piece: "wR" });
assert.ok(withMoveMotionProgress(castle, 0.5).rookProgress > 0);

const promotionReplay = parsePgnInstant(`[SetUp "1"]\n[FEN "7k/P7/8/8/8/8/8/7K w - - 0 1"]\n\n1. a8=Q+`);
const promotion = createMoveMotion(promotionReplay.frames[0], promotionReplay.frames[1]);
assert.equal(withMoveMotionProgress(promotion, 0.5).visiblePiece, "wP");
assert.equal(withMoveMotionProgress(promotion, 0.9).visiblePiece, "wQ");

const timeline = createMovieTimeline(quietReplay, { output: "preview", style: "tactical", cameraMotion: "director" });
const movieFrames = [...iterateMovieFrames(timeline)];
const movingFrames = movieFrames.filter(frame => frame.motion?.ply === 1);
assert.ok(movingFrames.length > 2);
assert.equal(movingFrames[0].motion.progress, 0);
assert.equal(movingFrames.at(-1).motion.progress, 1);
assert.deepEqual(e4.beforeBoard, quietReplay.frames[0].position.board);
assert.deepEqual(e4.afterBoard, quietReplay.frames[1].position.board);
assert.ok(Object.isFrozen(e4));
assert.ok(Object.isFrozen(e4.beforeBoard));

console.log("move-motion.test.mjs PASS");
