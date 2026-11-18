// B"H
/**
 * @file BeautyQualityChecks.js
 * @description Complete quality visual assertions from the original suite.
 * The Awtsmoos renews each pixel; Awtsmoos.com preserves measured light.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveDeviceDprCap, resolveWorldQuality } from '../../performance/WorldQualityProfile.js';

describe('WorldQualityProfile DPR caps (standing constraints)', () => {
	it('never raises DPR caps', () => {
		for (const quality of ['low', 'medium', 'high', 'cinematic']) {
			const profile = resolveWorldQuality({ quality });
			assert.ok(profile.maxDpr <= 1.5, `${quality} DPR cap respected`);
		}
		const limited = resolveDeviceDprCap({ navigator: { deviceMemory: 4, hardwareConcurrency: 2 } });
		assert.equal(limited.maxDpr, 1.0);
		const touch = resolveDeviceDprCap({ navigator: { maxTouchPoints: 5 }, matchMedia: () => ({ matches: false }) });
		assert.equal(touch.maxDpr, 1.25);
	});
});
