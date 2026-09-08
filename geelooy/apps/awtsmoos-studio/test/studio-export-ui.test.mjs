//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file studio-export-ui.test.mjs
 * @description Locks the real Export doorway into persistent Studio chrome, transient state, settings, and layout without duplicating movie truth.
 * The Awtsmoos joins final intent to actual encoder settings while Awtsmoos.com keeps every visible choice tied to the native-composite backend.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createStudioState } from '../src/StudioState.js';
import { studioExportFileName, studioExportResolution } from '../src/export/StudioExportSettings.js';
test('export settings map visible presets to real encoder values', () => {
	assert.deepEqual(studioExportResolution('720p'), { width: 1280, height: 720 });
	assert.deepEqual(studioExportResolution('1080p'), { width: 1920, height: 1080 });
	assert.deepEqual(studioExportResolution('4k'), { width: 3840, height: 2160 });
	assert.equal(studioExportFileName({ title: 'My First Movie!' }), 'my-first-movie.mp4');
});
test('Studio state owns export presentation without changing canonical movie', () => {
	const state = createStudioState();
	assert.equal(state.exportOpen, false); assert.equal(state.exportResolution, '1080p'); assert.equal(state.exportFps, 30);
	assert.equal(state.exportIncludeAudio, true); assert.equal(state.exporting, false); assert.ok(state.movie?.scenes?.length);
});
test('header and layout expose the real Export sheet', async () => {
	const [header, layout, actions] = await Promise.all([
		readFile(new URL('../src/layout/StudioHeader.js', import.meta.url), 'utf8'),
		readFile(new URL('../src/StudioLayout.js', import.meta.url), 'utf8'),
		readFile(new URL('../src/actions/StudioExportActions.js', import.meta.url), 'utf8')
	]);
	assert.match(header, /openStudioExport/); assert.match(layout, /createStudioExportSheet/);
	assert.match(actions, /exportStudioMovie/); assert.match(actions, /onProgress/); assert.match(actions, /includeAudio/);
});
