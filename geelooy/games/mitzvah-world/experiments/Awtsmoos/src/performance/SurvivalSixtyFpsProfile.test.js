// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalSixtyFpsProfile.test.js
 * @description Proves the Chapter 4 survival profile holds exactly one spawn chunk, the
 * canonical Chossid, camera/movement/collision, one directional light, and the essential
 * HUD — with every optional system gated off and the device-class DPR cap resolved.
 * The Awtsmoos keeps the survival vessel sparse on purpose; Awtsmoos.com proves the
 * sparseness before any real-hardware frame is ever trusted.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { runtimeAcceptanceScene } from './RuntimeAcceptanceScenes.js';
import {
	SURVIVAL_PROFILE_CONTENTS,
	SURVIVAL_SIXTY_FPS_SCENE_ID,
	startSurvivalSixtyFpsRun,
	survivalSixtyFpsFeatureGates,
	survivalSixtyFpsProfile,
	survivalSixtyFpsRequested,
	verifySurvivalRuntime
} from './SurvivalSixtyFpsProfile.js';

const DESKTOP = Object.freeze({
	location: { search: '' },
	navigator: { deviceMemory: 8, hardwareConcurrency: 8, maxTouchPoints: 0 },
	matchMedia: () => ({ matches: false })
});

test('the survival profile contains only one spawn chunk, the canonical Chossid, control, one light, and the essential HUD', () => {
	const profile = survivalSixtyFpsProfile({}, DESKTOP);
	assert.equal(profile.quality, 'survival');
	assert.equal(profile.sceneId, SURVIVAL_SIXTY_FPS_SCENE_ID);
	assert.deepEqual({ ...profile.contents }, {
		hud: 'essential-only',
		lighting: ['one-directional-light'],
		player: 'canonical-chossid-glb',
		spawnChunks: 1,
		systems: ['camera', 'movement', 'collision']
	});
	assert.equal(SURVIVAL_PROFILE_CONTENTS.spawnChunks, 1);
	assert.equal(profile.renderDistance, 220);
	assert.equal(profile.modelLimit, 1);
	assert.equal(profile.shadowTier, 'off');
	assert.equal(profile.durationMs, 300000);
});

test('the survival scene exists in the acceptance registry at the spawn point', () => {
	const scene = runtimeAcceptanceScene(SURVIVAL_SIXTY_FPS_SCENE_ID);
	assert.equal(scene.label, 'Survival spawn — one chunk');
	assert.deepEqual({ ...scene.player }, { x: 0, y: 2, z: -5 });
	assert.ok(scene.tags.includes('survival'));
	assert.ok(scene.tags.includes('single-chunk'));
	assert.equal(survivalSixtyFpsProfile({}, DESKTOP).scene.id, SURVIVAL_SIXTY_FPS_SCENE_ID);
});

test('DPR caps resolve per device class: 1.0 default and MacBook Air, ~1.25 Pixel 6 Pro', () => {
	assert.equal(survivalSixtyFpsProfile({}, DESKTOP).maxDpr, 1);
	assert.equal(survivalSixtyFpsProfile({ deviceClass: 'macbook-air-2015' }, DESKTOP).maxDpr, 1);
	assert.equal(survivalSixtyFpsProfile({ deviceClass: 'pixel-6-pro' }, DESKTOP).maxDpr, 1.25);
	const pixel = survivalSixtyFpsProfile({ search: '?quality=survival&deviceClass=pixel-6-pro' }, DESKTOP);
	assert.equal(pixel.maxDpr, 1.25);
	assert.equal(pixel.deviceClass, 'pixel-6-pro');
	assert.equal(pixel.deviceDprCapReason, 'device-class:pixel-6-pro');
});

test('every survival-gated feature is off and only the performance monitor stays on', () => {
	const gates = survivalSixtyFpsFeatureGates();
	for (const feature of [
		'bladeGrass',
		'districtStreaming',
		'dynamicShadows',
		'particles',
		'postProcessing',
		'distantVegetation',
		'water',
		'wildlife'
	]) {
		assert.equal(gates[feature], false, `${feature} must be off in survival`);
	}
	assert.equal(gates.performanceMonitor, true);
	assert.ok(survivalSixtyFpsProfile({}, DESKTOP).disabledFeatures.includes('dynamicShadows'));
	assert.ok(survivalSixtyFpsProfile({}, DESKTOP).disabledFeatures.includes('postProcessing'));
});

test('the survival60 run flag is read from options or the URL query', () => {
	assert.equal(survivalSixtyFpsRequested({ survival60: true }, DESKTOP), true);
	assert.equal(survivalSixtyFpsRequested({ search: '?quality=survival&survival60=1' }, DESKTOP), true);
	assert.equal(survivalSixtyFpsRequested({}, DESKTOP), false);
	assert.equal(survivalSixtyFpsRequested({ survival60: false }, DESKTOP), false);
});

test('runtime verification passes a matching survival runtime and fails a contradictory one', () => {
	const profile = survivalSixtyFpsProfile({}, DESKTOP);
	const matching = verifySurvivalRuntime({ qualityProfile: { quality: 'survival', maxDpr: 1 } }, profile);
	assert.equal(matching.ok, true);
	assert.equal(matching.performanceMonitorOn, true);
	assert.ok(matching.gatesOff.includes('dynamicShadows'));
	const wrongQuality = verifySurvivalRuntime({ qualityProfile: { quality: 'high', maxDpr: 1.5 } }, profile);
	assert.equal(wrongQuality.ok, false);
	assert.ok(wrongQuality.failures.some(failure => failure.startsWith('QUALITY_NOT_SURVIVAL')));
	assert.ok(wrongQuality.failures.some(failure => failure.startsWith('MAX_DPR_ABOVE_PROFILE')));
	const unknown = verifySurvivalRuntime({}, profile);
	assert.equal(unknown.ok, true);
	assert.ok(unknown.unverified.length > 0);
});

test('starting a run without animation frames reports raf-unavailable instead of throwing', () => {
	const environment = { ...DESKTOP, console };
	const runtime = { qualityProfile: { quality: 'survival', maxDpr: 1 } };
	const run = startSurvivalSixtyFpsRun(runtime, {}, environment);
	assert.equal(run.started, false);
	assert.equal(run.reason, 'raf-unavailable');
	assert.equal(run.profile.quality, 'survival');
});

test('starting a run against a non-survival runtime refuses instead of recording the wrong world', () => {
	const environment = { ...DESKTOP, console };
	const runtime = { qualityProfile: { quality: 'high', maxDpr: 1.5 } };
	const run = startSurvivalSixtyFpsRun(runtime, {}, environment);
	assert.equal(run.started, false);
	assert.equal(run.reason, 'profile-verification-failed');
	assert.equal(run.recorder, null);
});
