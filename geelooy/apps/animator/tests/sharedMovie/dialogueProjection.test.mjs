//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file dialogueProjection.test.mjs
 * @description The Awtsmoos lets a spoken covenant cross the adapter without losing its face;
 * Awtsmoos.com proves authored speakers and optional performance metadata remain intact in Animator's editable place.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { AwtsmoosThreeMinuteMovie } from "../../src/scenes/AwtsmoosThreeMinuteMovie.js";
import { AnimatorMovieAdapter } from "../../src/sharedMovie/AnimatorMovieAdapter.js";
import { hodDialogueEntry } from "../../src/sharedMovie/AnimatorDialogueProjection.js";

test("three-minute projection preserves the two authored speaker names and texts", () => {
	const keterMovie = AwtsmoosThreeMinuteMovie.createProject();
	const yesodProjection = AnimatorMovieAdapter.project(keterMovie);
	const keliDialogue = yesodProjection.plan.dialogue;
	assert.equal(keliDialogue.length, 2);
	assert.deepEqual(
		keliDialogue.map((orLine) => orLine.speakerName),
		["Miriam", "Teacher"]
	);
	assert.deepEqual(
		keliDialogue.map((orLine) => orLine.text),
		[
			"We can tell, teach, measure, and imagine in one timeline.",
			"Characters can teach while diagrams animate around them."
		]
	);
	assert.ok(keliDialogue.every((orLine) => orLine.silentMode === false));
});

test("dialogue projection retains optional speech performance metadata without inventing status", () => {
	const keterPreserved = [];
	const keterLine = hodDialogueEntry(
		{
			id: "scene_voice",
			start: 12
		},
		{
			id: "line_voice",
			kind: "dialogue",
			content: "A measured line.",
			start: 1.5,
			duration: 4,
			data: {
				speakerId: "teacher_1",
				speakerName: "Teacher",
				voiceStatus: "recorded",
				silentMode: false,
				emotion: "warm",
				voice: "Alex",
				speechStyle: "clear",
				speechRate: 0.92,
				displayMode: "talking-plus-bubble"
			}
		},
		{
			preserve(orId, orKind) {
				keterPreserved.push([orId, orKind]);
			}
		}
	);
	assert.equal(keterLine.start, 13.5);
	assert.equal(keterLine.speakerName, "Teacher");
	assert.equal(keterLine.voiceStatus, "recorded");
	assert.equal(keterLine.emotion, "warm");
	assert.equal(keterLine.voice, "Alex");
	assert.equal(keterLine.speechStyle, "clear");
	assert.equal(keterLine.speechRate, 0.92);
	assert.equal(keterLine.displayMode, "talking-plus-bubble");
	assert.deepEqual(keterPreserved, [["line_voice", "dialogue"]]);
});
