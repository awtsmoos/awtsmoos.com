// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleWebGlContractsTest
 * @description
 * Shared frame data must contain the complete village and deterministic particles,
 * while WebGL, context recovery, fallback, and compositor dispatch remain explicit.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createCinematicSceneFrame } from '../geelooy/social-composer/reel-studio/nle/NleCinematicSceneData.js';
import { createCinematicVillageProject } from '../geelooy/social-composer/reel-studio/nle/NleCinematicVillageFactory.js';
import { createCinematicParticleFrame } from '../geelooy/social-composer/reel-studio/nle/NleWebGlParticles.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('scene frame contains sky, ground, houses, trees, paths, lamps, and character', () => {
	const project = createCinematicVillageProject();
	const asset = project.nle.assets.find(item => item.kind === 'cinematic-world');
	const frame = createCinematicSceneFrame(project, asset, 8, project.duration, 1920, 1080);
	assert.ok(frame.triangles.length > 300);
	assert.equal(typeof frame.projectPoint, 'function');
	assert.equal(frame.atmosphere.wind > 0, true);
	assert.ok(frame.palette['material-window']);
});

test('particle frame is deterministic and follows graph counts', () => {
	const project = createCinematicVillageProject();
	const asset = project.nle.assets.find(item => item.kind === 'cinematic-world');
	const frame = createCinematicSceneFrame(project, asset, 4, project.duration, 1280, 720);
	const first = createCinematicParticleFrame(project, asset, frame, 4);
	const second = createCinematicParticleFrame(project, asset, frame, 4);
	assert.equal(first.length, 680);
	assert.deepEqual(first, second);
	assert.ok(first.some(point => point.color[3] < .3));
});

test('camera and character progression change rendered geometry', () => {
	const project = createCinematicVillageProject();
	const asset = project.nle.assets.find(item => item.kind === 'cinematic-world');
	const opening = createCinematicSceneFrame(project, asset, 0, project.duration, 1280, 720);
	const closing = createCinematicSceneFrame(project, asset, 22, project.duration, 1280, 720);
	assert.notDeepEqual(opening.triangles.at(-1).points, closing.triangles.at(-1).points);
});

test('runtime explicitly owns WebGL points, context recovery, and 2D fallback', () => {
	const renderer = read('geelooy/social-composer/reel-studio/nle/NleWebGlWorldRenderer.js');
	const program = read('geelooy/social-composer/reel-studio/nle/NleWebGlProgram.js');
	const compositor = read('geelooy/social-composer/reel-studio/nle/NleCompositor.js');
	assert.ok(renderer.includes("getContext('webgl'"));
	assert.ok(renderer.includes('webglcontextlost'));
	assert.ok(renderer.includes('drawCinematicFallback'));
	assert.ok(program.includes('gl.POINTS'));
	assert.ok(compositor.includes("asset?.kind === 'cinematic-world'"));
});
