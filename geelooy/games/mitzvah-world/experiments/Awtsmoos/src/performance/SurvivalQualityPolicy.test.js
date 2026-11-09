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
	survivalDeviceClass,
	survivalDeviceDprCap,
	survivalDeviceDprCaps,
	survivalFeatureOverride,
	survivalOptionalFeatures
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

test('survival gates dynamic shadows, post-processing, and distant vegetation too', () => {
	const options = { qualityProfile: { quality: 'survival' } };
	assert.equal(survivalFeatureOverride(options, 'dynamicShadows'), false);
	assert.equal(survivalFeatureOverride(options, 'postProcessing'), false);
	assert.equal(survivalFeatureOverride(options, 'distantVegetation'), false);
	assert.equal(survivalFeatureOverride(options, 'bladeGrass'), false);
	assert.equal(eretzWorldFeatureEnabled(options, 'dynamicShadows', true), false);
	assert.equal(eretzWorldFeatureEnabled(options, 'postProcessing', true), false);
	assert.equal(eretzWorldFeatureEnabled(options, 'distantVegetation', true), false);
	assert.ok(survivalOptionalFeatures().includes('dynamicShadows'));
	assert.ok(survivalOptionalFeatures().includes('postProcessing'));
	assert.ok(survivalOptionalFeatures().includes('distantVegetation'));
});

test('named device class caps DPR at 1.0 for the 2015 MacBook Air and 1.25 for the Pixel 6 Pro', () => {
	const macbook = resolveWorldQuality({ quality: 'survival', deviceClass: 'macbook-air-2015' }, DESKTOP);
	assert.equal(macbook.maxDpr, 1);
	assert.equal(macbook.deviceDprCapReason, 'device-class:macbook-air-2015');
	const pixel = resolveWorldQuality({ quality: 'survival', deviceClass: 'pixel-6-pro' }, DESKTOP);
	assert.equal(pixel.maxDpr, 1.25);
	assert.equal(pixel.deviceDprCapReason, 'device-class:pixel-6-pro');
	assert.equal(survivalDeviceDprCaps()['macbook-air-2015'], 1);
	assert.equal(survivalDeviceDprCaps()['pixel-6-pro'], 1.25);
});

test('device class also arrives through the URL query and never changes other qualities', () => {
	const environment = { ...DESKTOP, location: { search: '?quality=survival&deviceClass=pixel-6-pro' } };
	assert.equal(resolveWorldQuality({}, environment).maxDpr, 1.25);
	const high = resolveWorldQuality({ quality: 'high', deviceClass: 'pixel-6-pro' }, DESKTOP);
	assert.equal(high.maxDpr, 1.5);
	assert.equal(survivalDeviceClass({ deviceClass: 'pixel-6-pro' }, DESKTOP), 'pixel-6-pro');
	assert.equal(survivalDeviceClass({}, environment), 'pixel-6-pro');
});

test('auto and unknown device classes keep the survival 1.0 default instead of inventing a cap', () => {
	assert.equal(survivalDeviceClass({}, DESKTOP), 'auto');
	assert.equal(survivalDeviceDprCap({}, DESKTOP), null);
	assert.equal(survivalDeviceDprCap({ deviceClass: 'auto' }, DESKTOP), null);
	assert.equal(survivalDeviceDprCap({ deviceClass: 'some-future-phone' }, DESKTOP), null);
	assert.equal(resolveWorldQuality({ quality: 'survival', deviceClass: 'some-future-phone' }, DESKTOP).maxDpr, 1);
	assert.equal(resolveWorldQuality({ quality: 'survival', deviceClass: 'auto' }, DESKTOP).maxDpr, 1);
});
