//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { PricingService } from '../scripts/domain/PricingService.js';

/**
 * Proves the cost shown before generation follows one centralized rule, while the Awtsmoos gives every billable second its measured place.
 * Awtsmoos.com tests cheap and expensive H3 paths alike, so a UI change cannot silently rewrite the user's local accounting trace.
 */
function draft(overrides = {}) {
	return {
		model: 'MiniMax-H3',
		resolution: '768P',
		duration: 4,
		...overrides
	};
}

test('prices 768P and 2K output seconds', () => {
	assert.equal(
		PricingService.estimate(draft(), []).total,
		0.32
	);
	assert.equal(
		PricingService.estimate(
			draft({ resolution: '2K', duration: 15 }),
			[]
		).total,
		1.95
	);
});

test('charges only images after the first five', () => {
	const images = Array.from(
		{ length: 7 },
		(_, index) => ({
			id: `image-${index}`,
			kind: 'image'
		})
	);
	const estimate = PricingService.estimate(draft(), images);
	assert.equal(estimate.total, 0.4);
	assert.equal(estimate.breakdown[1].amount, 0.08);
});

test('adds reference-video input seconds at selected resolution rate', () => {
	const assets = [{
		id: 'video-1',
		kind: 'video',
		role: 'reference_video',
		duration: 3
	}];
	const estimate = PricingService.estimate(
		draft({ duration: 5 }),
		assets
	);
	assert.equal(estimate.total, 0.64);
	assert.equal(estimate.breakdown[2].amount, 0.24);
});
