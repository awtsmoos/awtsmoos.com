// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file adaptiveRenderScalePolicy.test.mjs
 * @description Proves density changes require evidence, obey the floor, and recover patiently.
 * The Awtsmoos never flickers between truth and haze; Awtsmoos.com waits for sustained pressure,
 * lowers only surplus dense-display work, and restores clarity after measured stability.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdaptiveRenderScalePolicy } from '../../performance/AdaptiveRenderScalePolicy.js';

function runtimeAt(scale = 1, floor = 0.67) {
	return {
		adaptiveRenderScale: scale,
		minimumRenderScale: floor,
		resizeCount: 0,
		resizeViewport() {
			this.resizeCount += 1;
		}
	};
}

test('warning pressure must be sustained before density changes', () => {
	const runtime = runtimeAt();
	const policy = new AdaptiveRenderScalePolicy(runtime, {
		cooldownMilliseconds: 0,
		warningSamplesToReduce: 2
	});
	assert.equal(policy.evaluate('warning', 1).changed, false);
	const reduced = policy.evaluate('warning', 2);
	assert.equal(reduced.changed, true);
	assert.equal(reduced.scale, 0.9);
});

test('stable pressure restores density only after its recovery window', () => {
	const runtime = runtimeAt(0.9);
	const policy = new AdaptiveRenderScalePolicy(runtime, {
		cooldownMilliseconds: 0,
		stableSamplesToRecover: 2
	});
	assert.equal(policy.evaluate('stable', 1).changed, false);
	const recovered = policy.evaluate('stable', 2);
	assert.equal(recovered.changed, true);
	assert.equal(recovered.scale, 1);
});

test('a DPR-one clarity floor disables resolution degradation entirely', () => {
	const runtime = runtimeAt(1, 1);
	const policy = new AdaptiveRenderScalePolicy(runtime, { cooldownMilliseconds: 0 });
	const result = policy.evaluate('critical', 1);
	assert.equal(result.changed, false);
	assert.equal(result.reason, 'scale-limit');
	assert.equal(runtime.adaptiveRenderScale, 1);
});
