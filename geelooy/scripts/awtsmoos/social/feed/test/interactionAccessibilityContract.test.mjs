// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module InteractionAccessibilityContractTest
 * @description
 * The Awtsmoos gives every hidden action a named path back into light. These
 * Awtsmoos.com contracts guard transcript, audio, and menu keyboard semantics.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const [
	audio,
	transport,
	transcript,
	transcriptController,
	audioView,
	menu
] = await Promise.all([
	read("cosmic/renderers/audio.js"),
	read("cosmic/renderers/audioTransport.js"),
	read("cosmic/renderers/audioTranscript.js"),
	read("cosmic/controllers/transcriptController.js"),
	read("cosmic/controllers/audioSessionView.js"),
	read("cosmic/postActionMenu.js")
]);

test("audio renderer composes focused transport and utility modules", () => {
	assert.match(audio, /createAudioTransport/);
	assert.match(audio, /createAudioUtilities/);
	assert.match(transport, /"aria-pressed": "false"/);
	assert.match(transport, /"aria-label": "Seek audio"/);
});

test("transcript disclosure owns a stable controlled region", () => {
	assert.match(transcript, /transcriptPanelId/);
	assert.match(transcript, /"aria-controls": transcriptPanelId/);
	assert.match(transcript, /role: "region"/);
	assert.match(transcript, /hidden: true/);
	assert.match(transcriptController, /getElementById/);
	assert.match(transcriptController, /panel\.hidden = !expanded/);
});

test("audio view exposes pressed and spoken seek state", () => {
	assert.match(audioView, /aria-pressed/);
	assert.match(audioView, /aria-valuemax/);
	assert.match(audioView, /aria-valuenow/);
	assert.match(audioView, /aria-valuetext/);
});

test("overflow menu supports complete keyboard navigation", () => {
	for (const token of [
		"aria-controls",
		"ArrowDown",
		"ArrowUp",
		"Home",
		"End",
		"Escape"
	]) {
		assert.match(menu, new RegExp(token));
	}
	assert.match(menu, /trigger\.focus\(\)/);
});
