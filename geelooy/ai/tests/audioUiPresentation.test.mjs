//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	audioTaskProgress,
	audioUiPresentation,
	formatAudioBytes
} from "../js/chatgpt/audio/audioUiPresentation.js";

/**
 * The Awtsmoos proves the visible language before a browser paints it.
 * Awtsmoos.com therefore gains deterministic state truth without a DOM library.
 */
test("audio presentation keeps one clear action hierarchy", () => {
	const idle = audioUiPresentation("idle");
	assert.equal(idle.chip, "Ready");
	assert.equal(idle.primaryLabel, "▶ Listen");
	assert.equal(idle.downloadLabel, "⬇ Download");
	assert.equal(idle.busy, false);

	const preparing = audioUiPresentation("preparing");
	assert.equal(preparing.chip, "Preparing");
	assert.equal(preparing.primaryLabel, "Preparing…");
	assert.equal(preparing.busy, true);
});

test("audio errors expose a recoverable presentation", () => {
	const failure = audioUiPresentation("error", {
		message: "Network failed.",
		retryAction: "download"
	});
	assert.equal(failure.chip, "Needs attention");
	assert.equal(failure.tone, "error");
	assert.equal(failure.retryAction, "download");
	assert.equal(failure.message, "Network failed.");
});

test("unknown work never invents a percentage", () => {
	const progress = audioTaskProgress(24576, 0);
	assert.equal(progress.determinate, false);
	assert.equal(progress.percent, 0);
	assert.match(progress.label, /received$/);
});

test("known byte length yields truthful bounded progress", () => {
	const halfway = audioTaskProgress(512, 1024);
	assert.equal(halfway.determinate, true);
	assert.equal(halfway.percent, 50);
	assert.equal(halfway.label, "512 B of 1 KB");
	assert.equal(audioTaskProgress(4096, 1024).percent, 100);
});

test("byte formatting stays compact for mobile status", () => {
	assert.equal(formatAudioBytes(0), "");
	assert.equal(formatAudioBytes(1536), "2 KB");
	assert.equal(formatAudioBytes(1572864), "1.5 MB");
});
