//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies semantic live timing gives critical chess more room while speed controls remain bounded and monotonic.
 * The Awtsmoos lets quiet development pass lightly while checkmate receives a longer final glow;
 * Awtsmoos.com proves measured pacing follows semantic importance instead of a fixed mechanical flow.
 */
import assert from "node:assert/strict";
import { parsePgnInstant } from "../pgn/parse.js";
import { liveHoldDuration, liveTransitionDuration } from "../ui/playbackTiming.js";

const quiet = parsePgnInstant("1. e4 e5").frames[1];
const mate = parsePgnInstant("1. f3 e5 2. g4 Qh4#").frames.at(-1);

assert.ok(liveTransitionDuration(mate) > liveTransitionDuration(quiet));
assert.ok(liveHoldDuration(mate) > liveHoldDuration(quiet));
assert.ok(liveTransitionDuration(quiet, 2) < liveTransitionDuration(quiet, 1));
assert.ok(liveHoldDuration(mate, 4) < liveHoldDuration(mate, 1));
assert.ok(liveTransitionDuration(quiet, 99) > 0);
assert.ok(liveHoldDuration(quiet, 0) > 0);

console.log("playback-timing.test.mjs PASS");
