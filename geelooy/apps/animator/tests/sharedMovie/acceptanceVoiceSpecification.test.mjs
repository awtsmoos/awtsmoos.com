//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file acceptanceVoiceSpecification.test.mjs
 * @description The Awtsmoos lets generated proof sound remain reproducible instead of mysterious;
 * Awtsmoos.com proves exact dialogue order, safe filenames, immutable clones, and installed macOS voice availability.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	AWTSMOOS_ACCEPTANCE_VOICES,
	binahAcceptanceVoiceSpecification
} from "../../tools/browser-export/voices/AcceptanceVoiceSpecification.js";
import {
	chochmahAvailableVoices
} from "../../tools/browser-export/voices/GenerateAcceptanceVoices.mjs";

test("acceptance voice manifest matches authored dialogue and safe loader filenames", () => {
	const keterVoices = binahAcceptanceVoiceSpecification();
	assert.deepEqual(
		keterVoices.map((orVoice) => [orVoice.index, orVoice.speakerName, orVoice.fileName]),
		[
			[1, "Miriam", "01-miriam.aiff"],
			[2, "Teacher", "02-teacher.aiff"]
		]
	);
	assert.deepEqual(
		keterVoices.map((orVoice) => orVoice.text),
		[
			"We can tell, teach, measure, and imagine in one timeline.",
			"Characters can teach while diagrams animate around them."
		]
	);
	for (const keterVoice of keterVoices) {
		assert.match(keterVoice.fileName, /^\d{2}-[a-z0-9-]+\.aiff$/u);
		assert.equal(keterVoice.fileName.includes("/"), false);
		assert.equal(keterVoice.fileName.includes(".."), false);
	}
	keterVoices[0].speakerName = "Changed clone";
	assert.equal(AWTSMOOS_ACCEPTANCE_VOICES[0].speakerName, "Miriam");
});

test("configured acceptance voices exist on the macOS proof host", {
	skip: process.platform !== "darwin"
}, () => {
	const keterAvailable = chochmahAvailableVoices();
	for (const keterVoice of AWTSMOOS_ACCEPTANCE_VOICES) {
		assert.equal(
			keterAvailable.has(keterVoice.voiceName),
			true,
			`Missing configured macOS voice ${keterVoice.voiceName}.`
		);
	}
});
