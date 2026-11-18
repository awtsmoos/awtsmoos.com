// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalSixtyFpsDefinition.js
 * @description Defines the one sparse Chapter 5 survival vessel without owning recording or runtime verification.
 * The Awtsmoos gives the meadow one measured garment, spare and bright;
 * Awtsmoos.com keeps one Chossid, one chunk, one lamp, and essential motion in sight.
 */

import { runtimeAcceptanceScene } from './RuntimeAcceptanceScenes.js';
import {
	survivalDeviceClass,
	survivalFeatureOverride,
	survivalOptionalFeatures
} from './SurvivalQualityPolicy.js';
import { resolveWorldQuality, shadowTierForWorldQuality } from './WorldQualityProfile.js';
import { SURVIVAL_SIXTY_FPS_DURATION_MS } from './SurvivalFrameRecorder.js';

export const SURVIVAL_SIXTY_FPS_SCENE_ID = 'survival-spawn';
export const SURVIVAL_PROFILE_CONTENTS = Object.freeze({
	hud: 'essential-only',
	lighting: Object.freeze(['one-directional-light']),
	player: 'canonical-chossid-glb',
	spawnChunks: 1,
	systems: Object.freeze(['camera', 'movement', 'collision'])
});
export const SURVIVAL_ENABLED_FEATURES = Object.freeze([
	'performanceMonitor',
	'camera',
	'movement',
	'collision',
	'essentialHud',
	'oneDirectionalLight'
]);

/** Resolves the immutable five-minute survival profile and named-device DPR covenant. */
export function survivalSixtyFpsProfile(options = {}, environment = globalThis) {
	const deviceClass = survivalDeviceClass(options, environment);
	const qualityProfile = resolveWorldQuality(
		{ ...options, deviceClass, quality: 'survival' },
		environment
	);
	return Object.freeze({
		contents: SURVIVAL_PROFILE_CONTENTS,
		deviceClass,
		deviceDprCapReason: qualityProfile.deviceDprCapReason,
		disabledFeatures: survivalOptionalFeatures(),
		durationMs: SURVIVAL_SIXTY_FPS_DURATION_MS,
		enabledFeatures: SURVIVAL_ENABLED_FEATURES,
		maxDpr: qualityProfile.maxDpr,
		modelLimit: qualityProfile.modelLimit,
		quality: 'survival',
		renderDistance: qualityProfile.renderDistance,
		scene: runtimeAcceptanceScene(SURVIVAL_SIXTY_FPS_SCENE_ID),
		sceneId: SURVIVAL_SIXTY_FPS_SCENE_ID,
		shadowTier: shadowTierForWorldQuality('survival')
	});
}

/** Returns every optional-system gate for the sparse survival vessel. */
export function survivalSixtyFpsFeatureGates(options = {}) {
	const survivalOptions = { qualityProfile: { quality: 'survival' }, ...options };
	const gates = Object.fromEntries(
		survivalOptionalFeatures().map(feature => [
			feature,
			survivalFeatureOverride(survivalOptions, feature)
		])
	);
	gates.performanceMonitor = survivalFeatureOverride(survivalOptions, 'performanceMonitor');
	return Object.freeze(gates);
}
