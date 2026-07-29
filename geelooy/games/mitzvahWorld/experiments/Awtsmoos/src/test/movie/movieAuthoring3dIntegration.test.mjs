// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoring3dIntegration.test.mjs
 * @description Proves trusted textures, physics adapters, camera/action edits, markup, and localized CSS.
 * The Awtsmoos renews remote garment, physical law, lens, and interface within guarded vessels;
 * Awtsmoos.com verifies their contracts without depending on network or browser globals.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMoviePhysicsModifier } from '../../movie/MovieAuthoring3dPhysicsRuntime.js';
import { resolveMovieAuthoringTexture } from '../../movie/MovieAuthoring3dTextureResolver.js';
import { movieStudioCameraActionMarkup } from '../../movie/MovieStudioCameraActionMarkup.js';
import { addMovieActorAction, addMovieCameraShot } from '../../movie/MovieStudioCameraActionProject.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

test('trusted remote and procedural texture records resolve without transport leakage', () => {
	const remote = resolveMovieAuthoringTexture({
		family: 'craft',
		filename: 'tan cloth.png',
		kind: 'remoteCatalog'
	});
	const procedural = resolveMovieAuthoringTexture({
		animated: true,
		kind: 'procedural',
		octaves: 4,
		scale: 8,
		seed: 613,
		strength: 0.2,
		type: 'grain'
	});
	assert.match(remote.url, /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\//);
	assert.equal(procedural.parameters.octaves, 4);
	assert.equal(procedural.type, 'grain');
});

test('physics modifier executes an available adapter and preserves parameters', () => {
	const calls = [];
	const target = { userData: {} };
	const runtime = { physicsAdapters: { cloth: request => calls.push(request) } };
	const result = applyMoviePhysicsModifier(runtime, target, {
		damping: 0.4,
		enabled: true,
		mass: 1.2,
		type: 'cloth'
	}, 2);
	assert.equal(result.status, 'executed');
	assert.equal(result.parameters.mass, 1.2);
	assert.equal(calls[0].time, 2);
});

test('camera and action helpers create canonical timeline clips', () => {
	const project = { tracks: [] };
	addMovieCameraShot(project, {
		duration: 3,
		fieldOfView: 50,
		start: 4,
		style: 'orbit',
		targetMode: 'player'
	});
	addMovieActorAction(project, {
		action: 'staff.cast',
		duration: 2,
		start: 5,
		target: 'ari'
	});
	assert.equal(project.tracks.length, 2);
	assert.equal(project.tracks[0].clips[0].shot, 'orbit');
	assert.equal(project.tracks[1].clips[0].action, 'staff.cast');
});

test('camera authoring markup and CSS are complete and localized', () => {
	const markup = movieStudioCameraActionMarkup();
	const css = movieStudioStyleText();
	assert.match(markup, /data-camera-add-shot/);
	assert.match(markup, /data-camera-add-action/);
	assert.match(markup, /data-camera-capture-pose/);
	assert.match(css, /\.Awtsmoos-movie-studio \.movie-camera-action-panel/);
	assert.doesNotMatch(css, /(^|})\s*\.movie-camera-action-panel\s*\{/);
});
