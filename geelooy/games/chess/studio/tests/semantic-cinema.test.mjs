//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies semantic camera selection, three-beat direction, overlay truth, finale separation, and frame-perfect movie timing.
 * The Awtsmoos gives every critical move before, action, consequence, and then its final revealed sign;
 * Awtsmoos.com proves each beat deterministic while the outro remains its own cinematic line.
 */
import assert from "node:assert/strict";
import { buildShotPlan } from "../cinema/shotPlan.js";
import { createMovieTimeline, iterateMovieFrames } from "../cinema/movieTimeline.js";
import { parsePgnInstant } from "../pgn/parse.js";
import { choosePreset } from "../rendering/cameraDirector.js";

const opening = parsePgnInstant("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6");
assert.equal(choosePreset(opening.frames[1]), "tactical");
assert.notEqual(choosePreset(opening.frames[3]), "rookRail");

const mate = parsePgnInstant(`[Event "Semantic Cinema"]\n[White "Ada"]\n[Black "Noam"]\n[Result "0-1"]\n\n1. f3 e5 2. g4 Qh4#`);
const shots = buildShotPlan(mate, { style: "cinematic", cameraMotion: "director" });
const mateMoveShots = shots.filter(shot => shot.frame?.ply === 4 && shot.kind !== "outro");
assert.deepEqual(mateMoveShots.map(shot => shot.kind), ["action", "consequence"]);
const anticipation = shots.find(shot => shot.kind === "anticipation" && shot.frame?.ply === 3);
assert.ok(anticipation);
assert.equal(mateMoveShots[0].overlay.san, "Qh4#");
assert.equal(shots.at(-1).kind, "outro");
assert.equal(shots.at(-1).overlay.result, "0-1");
assert.ok(mateMoveShots[0].duration > 0);
assert.ok(mateMoveShots[1].duration > 0);

const timeline = createMovieTimeline(mate, { output: "preview", style: "cinematic", cameraMotion: "director" });
const frames = [...iterateMovieFrames(timeline)];
assert.equal(frames.length, timeline.frameCount);
assert.equal(frames.at(-1).index, timeline.frameCount - 1);
assert.equal(frames[0].time, 0);
assert.ok(timeline.duration > 0);
assert.equal(Object.isFrozen(timeline.shots), true);

const repeat = buildShotPlan(mate, { style: "cinematic", cameraMotion: "director" });
assert.deepEqual(repeat, shots);
console.log("semantic-cinema.test.mjs PASS");
