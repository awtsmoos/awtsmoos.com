// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeSamplingContext.test.mjs
 * @description Proves focus, visibility, eligibility, and transition testimony stay distinct.
 * The Awtsmoos renews foreground and hidden tab alike; Awtsmoos.com tests that only the
 * living foreground vessel may testify for the sixty-frame acceptance covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeSamplingContext } from '../../performance/RuntimeSamplingContext.js';

test('sampling context classifies focus and records transitions', () => {
	const kinds = ['unfocused', 'unfocused', 'focused', 'hidden', 'focused'];
	let index = 0;
	const context = new RuntimeSamplingContext(() => ({
		kind: kinds[Math.min(index++, kinds.length - 1)]
	}));
	const first = context.sample();
	const second = context.sample();
	const third = context.sample();
	const fourth = context.sample();
	const fifth = context.sample();
	assert.equal(first.changed, false);
	assert.equal(first.foregroundEligible, false);
	assert.equal(second.changed, false);
	assert.equal(third.changed, true);
	assert.equal(third.foregroundEligible, true);
	assert.equal(fourth.recordable, false);
	assert.equal(fifth.transitions, 3);
});

test('unknown context remains recordable but cannot prove foreground performance', () => {
	const context = new RuntimeSamplingContext(() => ({ kind: 'mystery' }));
	const sample = context.sample();
	assert.equal(sample.kind, 'unknown');
	assert.equal(sample.recordable, true);
	assert.equal(sample.foregroundEligible, false);
	assert.equal(sample.reason, 'focus-unknown');
});
