// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAssetGenerationTest
 * @description
 * Deterministic recipes, repeated generation, insertion, state history, and
 * recorder naming stay stable so full movies remain editable and reproducible.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { addAssetToProject } from '../geelooy/social-composer/reel-studio/nle/NleAssetClipFactory.js';
import {
	createGradientAsset,
	createParticlesAsset,
	createTitleAsset,
	createToneAsset
} from '../geelooy/social-composer/reel-studio/nle/NleAssetGenerators.js';
import { NLE_ASSET_PRESETS } from '../geelooy/social-composer/reel-studio/nle/NleAssetPresets.js';
import { createNlePresetInstance } from '../geelooy/social-composer/reel-studio/nle/NleGeneratedAssetFactory.js';
import { ensureNleProject } from '../geelooy/social-composer/reel-studio/nle/NleProjectDefaults.js';
import { NleProjectState } from '../geelooy/social-composer/reel-studio/nle/NleProjectState.js';
import { nleMovieFileName } from '../geelooy/social-composer/reel-studio/nle/NleRecorderFormat.js';

function baseProject() {
	return ensureNleProject({
		duration: 12,
		fps: 24,
		resolution: { height: 720, width: 1280 },
		seed: 613,
		title: 'Generated Test',
		tracks: []
	});
}

test('generated assets are deterministic with explicit seeds', () => {
	const left = createParticlesAsset({ label: 'Light', seed: 18 });
	const right = createParticlesAsset({ label: 'Light', seed: 18 });
	assert.deepEqual(left, right);
	assert.equal(createGradientAsset({ label: 'Sky', seed: 9 }).kind, 'gradient');
	assert.equal(createTitleAsset({ text: 'B/H' }).kind, 'title');
	assert.equal(createToneAsset({ frequency: 432 }).frequency, 432);
});

test('repeated preset generation creates distinct reproducible instances', () => {
	const preset = NLE_ASSET_PRESETS.find(item => item.id === 'particles');
	const first = createNlePresetInstance(preset, 1);
	const second = createNlePresetInstance(preset, 2);
	const repeated = createNlePresetInstance(preset, 1);
	assert.notEqual(first.id, second.id);
	assert.notEqual(first.seed, second.seed);
	assert.deepEqual(first, repeated);
});

test('asset insertion chooses visual, overlay, and audio extension tracks', () => {
	let project = baseProject();
	const gradient = createGradientAsset({ label: 'Sky', seed: 1 });
	const title = createTitleAsset({ label: 'Words', seed: 2 });
	const tone = createToneAsset({ label: 'Drone', seed: 3 });
	project = addAssetToProject(project, gradient, 2);
	project = addAssetToProject(project, title, 4);
	project = addAssetToProject(project, tone, 6);
	assert.ok(project.tracks.find(track => track.id === 'nle-visual').clips.some(clip => clip.assetId === gradient.id));
	assert.ok(project.tracks.find(track => track.id === 'nle-overlay').clips.some(clip => clip.assetId === title.id));
	assert.ok(project.tracks.find(track => track.id === 'nle-audio').clips.some(clip => clip.assetId === tone.id));
});

test('project state records undo and redo around complete mutations', () => {
	const state = new NleProjectState(baseProject());
	const original = state.project.title;
	state.mutate('title', project => { project.title = 'Changed'; });
	assert.equal(state.project.title, 'Changed');
	assert.equal(state.undo(), true);
	assert.equal(state.project.title, original);
	assert.equal(state.redo(), true);
	assert.equal(state.project.title, 'Changed');
});

test('movie filename preserves truthful browser container extension', () => {
	assert.equal(
		nleMovieFileName('A New Light', 'video/webm;codecs=vp9'),
		'a-new-light.webm'
	);
});
