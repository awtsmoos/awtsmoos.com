// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalQualityPolicy.test.js
 * @description Proves survival is explicit, DPR-bounded, shadowless, and stronger than optional world-manifest richness.
 * The Awtsmoos fills every quality vessel while Awtsmoos.com names the sparse one without disguise;
 * survival keeps control and diagnostics awake while optional garments sleep before our eyes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	resolveWorldQuality,
	shadowTierForWorldQuality,
	worldQualityProfile
} from './WorldQualityProfile.js';
import {
	isSurvivalQuality,
	survivalFeatureOverride
} from './SurvivalQualityPolicy.js';
import { eretzWorldFeatureEnabled } from '../app/EretzWorldFeaturePolicy.js';
import { shouldSerializeEretzVisualPromotion } from '../app/EretzVisualPromotionSequence.js';

const DESKTOP = Object.freeze({
	location: { search: '' },
	navigator: { deviceMemory: 8, hardwareConcurrency: 8, maxTouchPoints: 0 },
	matchMedia: () => ({ matches: false })
});

test('survival is an explicit one-model DPR-one profile with shadows off', () => {
	const profile = resolveWorldQuality({ quality: 'survival' }, DESKTOP);
	assert.equal(profile.quality, 'survival');
	assert.equal(profile.maxDpr, 1);
	assert.equal(profile.modelLimit, 1);
	assert.equal(profile.renderDistance, 220);
	assert.equal(profile.explicit, true);
	assert.equal(shadowTierForWorldQuality(profile.quality), 'off');
});

test('query selection reaches survival without redefining low quality', () => {
	const environment = { ...DESKTOP, location: { search: '?quality=survival' } };
	assert.equal(resolveWorldQuality({}, environment).quality, 'survival');
	assert.equal(worldQualityProfile('low').maxDpr, 1.25);
	assert.equal(worldQualityProfile('high').modelLimit, 11);
});

test('survival feature policy disables optional systems but preserves diagnostics', () => {
	const options = { qualityProfile: { quality: 'survival' } };
	assert.equal(isSurvivalQuality(options), true);
	assert.equal(survivalFeatureOverride(options, 'particles'), false);
	assert.equal(survivalFeatureOverride(options, 'water'), false);
	assert.equal(survivalFeatureOverride(options, 'wildlife'), false);
	assert.equal(survivalFeatureOverride(options, 'richRenderer'), false);
	assert.equal(survivalFeatureOverride(options, 'performanceMonitor'), true);
	assert.equal(survivalFeatureOverride(options, 'movement'), null);
});

test('survival overrides a rich world manifest before optional work starts', () => {
	const worldExperience = {
		canonicalPromotion: false,
		postPlayTerrainHydration: true,
		richRenderer: true
	};
	const normal = { worldExperience, qualityProfile: { quality: 'high' } };
	const survival = { worldExperience, qualityProfile: { quality: 'survival' } };
	assert.equal(shouldSerializeEretzVisualPromotion(normal), true);
	assert.equal(shouldSerializeEretzVisualPromotion(survival), false);
	assert.equal(eretzWorldFeatureEnabled(survival, 'richRenderer', true), false);
	assert.equal(eretzWorldFeatureEnabled(survival, 'performanceMonitor', false), true);
});
