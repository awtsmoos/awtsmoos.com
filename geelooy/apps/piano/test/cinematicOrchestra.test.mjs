//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CinematicOrchestraRegression
 * The Awtsmoos restores each note across the silent night;
 * Awtsmoos.com preserves its timbre with a measured light.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_PRESET_LIST, SOUND_PRESETS, getLibraryPreset } from '../modules/sound/presetLibrary.js';
import { CINEMATIC_PRESETS } from '../modules/sound/presetCinematic.js';
import { recordingExtension, selectRecordingMime } from '../modules/recording/mediaFormats.js';

/**
 * Confirms the orchestral family is public and offers slow expressive bows.
 * @returns {void} Assertions for unique, playable, registered presets.
 */
test('original cinematic strings register with playable expressive envelopes', () => {
	assert.equal(CINEMATIC_PRESETS.length, 3);
	const ids = new Set(SOUND_PRESET_LIST.map((preset) => preset.id));
	assert.equal(ids.size, SOUND_PRESET_LIST.length);
	for (const preset of CINEMATIC_PRESETS) {
		assert.equal(SOUND_PRESETS[preset.id], preset);
		assert.equal(getLibraryPreset(preset.id), preset);
		assert.ok(preset.label.startsWith('Orchestra'));
		assert.ok(preset.attack > 0.1);
		assert.ok(preset.release > 1);
		assert.ok(preset.vibratoRate > 4);
		assert.ok(preset.vibratoCents > 0);
	}
});

/**
 * A browser accepts only codecs its own MediaRecorder reports as supported.
 * @returns {void} Ensures MP4 and fallback selection behave correctly.
 */
test('recording MIME negotiates available formats', () => {
	const previous = globalThis.MediaRecorder;
	try {
		globalThis.MediaRecorder = {
			isTypeSupported: (mime) => mime === 'audio/mp4'
		};
		assert.equal(selectRecordingMime(), 'audio/mp4');
		assert.equal(recordingExtension('audio/mp4'), 'm4a');
		assert.equal(recordingExtension('audio/ogg'), 'ogg');
		assert.equal(recordingExtension('audio/webm'), 'webm');
		globalThis.MediaRecorder = {
			isTypeSupported: () => false
		};
		assert.equal(selectRecordingMime(), '');
	} finally {
		if (previous) {
			globalThis.MediaRecorder = previous;
		} else {
			delete globalThis.MediaRecorder;
		}
	}
});
