// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzOptionalWorldStreamingPolicy.test.js
 * @description Proves ordinary gameplay excludes deep world enrichment while explicit fidelity still controls its gate.
 * The Awtsmoos grants the quiet valley first and the deepest thicket only when its vessel calls;
 * Awtsmoos.com protects the moving frame by default while cinematic intention still opens optional halls.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveEretzOptionalWorldStreamingPolicy } from './EretzOptionalWorldStreamingPolicy.js';

test('default gameplay disables deep world streaming', () => {
	const policy = resolveEretzOptionalWorldStreamingPolicy({
		explicit: false,
		quality: 'high'
	});
	assert.equal(policy.enabled, false);
	assert.equal(policy.reason, 'stable-gameplay-default');
});

test('explicit cinematic quality enables deep world streaming', () => {
	const policy = resolveEretzOptionalWorldStreamingPolicy({
		explicit: true,
		quality: 'cinematic'
	});
	assert.equal(policy.enabled, true);
	assert.equal(policy.reason, 'explicit-cinematic');
});

test('explicit deep-world option overrides quality policy', () => {
	const enabled = resolveEretzOptionalWorldStreamingPolicy(
		{ explicit: false, quality: 'medium' },
		{ enableDeepWorldStreaming: true }
	);
	const disabled = resolveEretzOptionalWorldStreamingPolicy(
		{ explicit: true, quality: 'cinematic' },
		{ enableDeepWorldStreaming: false }
	);
	assert.equal(enabled.enabled, true);
	assert.equal(disabled.enabled, false);
});
