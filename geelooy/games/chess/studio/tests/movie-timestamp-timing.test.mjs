//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies source timestamps influence cinema rhythm without replacing semantic importance or exploding export length.
 * The Awtsmoos lets a quick response pass lightly and a long thought breathe while every finite scale remains bounded;
 * Awtsmoos.com proves timing can color the movie without letting one noisy clock make the whole render ungrounded.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { getMovieStyle } from "../cinema/moviePresets.js";
import { semanticMoveDuration } from "../cinema/shotTiming.js";

const style = getMovieStyle("cinematic");
const semanticFrame = Object.freeze({ event: Object.freeze({ importance: 20 }), move: Object.freeze({}) });

/** Creates one frame that differs only by normalized source elapsed time. */
function timedFrame(elapsedSeconds) {
	return Object.freeze({
		...semanticFrame,
		timing: Object.freeze({ elapsedSeconds })
	});
}

test("source timing creates bounded fast and long-think cinema rhythm", () => {
	const legacy = semanticMoveDuration(semanticFrame, style);
	const instant = semanticMoveDuration(timedFrame(0), style);
	const longThink = semanticMoveDuration(timedFrame(21), style);
	const enormous = semanticMoveDuration(timedFrame(Number.MAX_SAFE_INTEGER), style);
	assert.ok(instant < legacy);
	assert.ok(longThink > legacy);
	assert.ok(enormous <= legacy * 1.55);
	assert.ok(Number.isFinite(enormous));
});

test("missing or unusable elapsed timing preserves legacy semantic duration exactly", () => {
	const legacy = semanticMoveDuration(semanticFrame, style);
	assert.equal(semanticMoveDuration({ ...semanticFrame, timing: null }, style), legacy);
	assert.equal(semanticMoveDuration(timedFrame(null), style), legacy);
	assert.equal(semanticMoveDuration(timedFrame(Number.POSITIVE_INFINITY), style), legacy);
	assert.equal(semanticMoveDuration(timedFrame(-1), style), legacy);
});
