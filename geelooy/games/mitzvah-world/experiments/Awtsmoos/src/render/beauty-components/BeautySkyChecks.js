// B"H
/**
 * @file BeautySkyChecks.js
 * @description Complete sky visual assertions from the original suite.
 * The Awtsmoos renews each pixel; Awtsmoos.com preserves measured light.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sampleBeautyPalette } from '../BeautyPalette.js';
import { BEAUTY_SKY_BUDGETS, beautySkyBudget, computeBeautySky, computeCloudField, computeSkyGradient, computeSunShafts, sunDiscParams } from '../BeautySky.js';
import { finiteTriple } from './BeautyAssertionHelpers.js';

describe('BeautySky', () => {
	it('budgets are bounded per tier', () => {
		for (const [tier, budget] of Object.entries(BEAUTY_SKY_BUDGETS)) {
			assert.ok(budget.clouds <= 28, `${tier} clouds bounded`);
			assert.ok(budget.sunShafts <= 9, `${tier} shafts bounded`);
		}
		assert.deepEqual(beautySkyBudget('nope'), BEAUTY_SKY_BUDGETS.high);
	});

	it('cloud field is deterministic and within budget', () => {
		const a = computeCloudField('high');
		const b = computeCloudField('high');
		assert.equal(a.length, BEAUTY_SKY_BUDGETS.high.clouds);
		assert.deepEqual(a, b);
		assert.equal(computeCloudField('low').length, BEAUTY_SKY_BUDGETS.low.clouds);
		for (const cloud of a) {
			assert.ok(Number.isFinite(cloud.x) && Number.isFinite(cloud.y) && Number.isFinite(cloud.z));
			assert.ok(cloud.scaleX > 0 && cloud.scaleY > 0);
		}
	});

	it('gradient stops ascend and stay finite', () => {
		const palette = sampleBeautyPalette(0.78);
		const gradient = computeSkyGradient(palette);
		assert.equal(gradient.length, 6);
		for (let i = 1; i < gradient.length; i++) {
			assert.ok(gradient[i][0] > gradient[i - 1][0], 'stops ascend');
		}
		for (const stop of gradient) finiteTriple([stop[1], stop[2], stop[3]], 'stop color');
	});

	it('sun disc swells and reddens as it sinks; moon takes over at night', () => {
		const day = sunDiscParams(sampleBeautyPalette(0.5));
		const golden = sunDiscParams(sampleBeautyPalette(0.78));
		const night = sunDiscParams(sampleBeautyPalette(0.0));
		assert.ok(golden.discAngularSize > day.discAngularSize, 'disc swells at golden hour');
		assert.ok(night.moonIntensity > 0 && !night.isDay, 'moon at night');
		assert.ok(day.isDay && day.coreIntensity > 0, 'sun by day');
	});

	it('shafts respect the budget and fade at noon and night', () => {
		const noonShafts = computeSunShafts(sampleBeautyPalette(0.5), [-0.45, 0.9, -0.72], 'high');
		const nightShafts = computeSunShafts(sampleBeautyPalette(0.0), [-0.45, 0.35, -0.72], 'high');
		// t=0.70: the sun hangs low but still above the horizon — prime shaft territory.
		const goldenShafts = computeSunShafts(sampleBeautyPalette(0.70), [-0.45, 0.35, -0.72], 'high');
		assert.equal(noonShafts.length, 0);
		assert.equal(nightShafts.length, 0);
		assert.ok(goldenShafts.length > 0 && goldenShafts.length <= BEAUTY_SKY_BUDGETS.high.sunShafts);
		for (const shaft of goldenShafts) {
			assert.ok(shaft.intensity > 0 && shaft.intensity <= 0.3, 'shaft intensity bounded');
			assert.ok(shaft.length > 0 && shaft.width > 0);
		}
	});

	it('one-call sky vessel is complete', () => {
		const sky = computeBeautySky(0.78, 'medium');
		assert.ok(sky.palette && sky.gradient && sky.sun && sky.clouds && sky.shafts);
		assert.equal(sky.clouds.length, BEAUTY_SKY_BUDGETS.medium.clouds);
	});
});
