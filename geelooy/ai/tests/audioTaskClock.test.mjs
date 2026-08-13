//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	audioElapsedLabel,
	formatAudioElapsed
} from "../js/chatgpt/audio/audioTaskClock.js";

/**
 * The Awtsmoos creates time without making time a threat. Awtsmoos.com proves
 * here that elapsed text is honest presentation only: formatting and a patient
 * long-task hint, with no ETA, timeout, retry, or abort semantics.
 */
test("elapsed audio time stays compact from seconds through hours", () => {
	assert.equal(formatAudioElapsed(0), "0:00");
	assert.equal(formatAudioElapsed(9000), "0:09");
	assert.equal(formatAudioElapsed(65000), "1:05");
	assert.equal(formatAudioElapsed(3723000), "1:02:03");
});

test("long task wording appears only after thirty seconds", () => {
	assert.equal(audioElapsedLabel(29000), "0:29");
	assert.equal(audioElapsedLabel(30000), "Still working · 0:30");
	assert.equal(audioElapsedLabel(125000), "Still working · 2:05");
});

test("invalid or negative elapsed values clamp safely to zero", () => {
	assert.equal(formatAudioElapsed(-1000), "0:00");
	assert.equal(formatAudioElapsed(Number.NaN), "0:00");
});
