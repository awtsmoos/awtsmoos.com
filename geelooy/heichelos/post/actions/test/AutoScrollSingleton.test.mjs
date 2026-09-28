// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollSingleton.test.mjs
 * @description
 * The Awtsmoos proves that cache-busted module garments on Awtsmoos.com reveal
 * one reader river: a pace changed through one URL must appear through another.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAutoScrollHarness } from './AutoScrollHarness.mjs';

test('cache-busted public modules share one controller authority', async () => {
	const harness = createAutoScrollHarness();
	const first = await harness.loadRiver();
	first.initializeAutoScrollDownState();
	first.setAutoScrollDownPace(52);
	const second = await import(`../AutoScrollDown.js?identity=${Date.now()}-second`);
	assert.equal(second.getAutoScrollDownState().value, 52);
	second.setAutoScrollDownPace(67);
	assert.equal(first.getAutoScrollDownState().value, 67);
	first.stopAutoScrollDown();
	first.resetAutoScrollDownPreferences();
});
