//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file eretzVisualPromotionSequence.test.mjs
 * @description Proves lightweight authored worlds settle terrain before yielding a frame and promoting the rich renderer.
 * The Awtsmoos lets Awtsmoos.com add visual garments one at a time: earth completes first, motion receives a frame,
 * then the renderer enters; richer canonical worlds preserve their independent promotion behavior.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	shouldSerializeEretzVisualPromotion,
	startEretzVisualPromotionSequence
} from '../../app/EretzVisualPromotionSequence.js';

test('Blank Meadow policy shape serializes terrain before renderer promotion', async () => {
	const events = [];
	let resolveTerrain;
	const terrainHydration = new Promise(resolve => {
		resolveTerrain = () => {
			events.push('terrain');
			resolve({ phase: 'essential-ready' });
		};
	});
	const options = {
		worldExperience: {
			canonicalPromotion: false,
			postPlayTerrainHydration: true,
			richRenderer: true
		}
	};
	const diagnostics = { runtime: { destroyed: false } };
	const sequence = startEretzVisualPromotionSequence(
		diagnostics,
		{},
		null,
		options,
		Promise.resolve({ terrainHydration }),
		{
			loadPolicy: async () => ({
				startEretzRendererByWorldPolicy() {
					events.push('renderer');
					return 'ready';
				}
			}),
			nextFrame: async () => events.push('frame')
		}
	);
	await Promise.resolve();
	assert.deepEqual(events, []);
	resolveTerrain();
	assert.equal(await sequence, 'ready');
	assert.deepEqual(events, ['terrain', 'frame', 'renderer']);
});

test('rich worlds do not wait for terrain before renderer policy', async () => {
	const events = [];
	const result = await startEretzVisualPromotionSequence(
		{ runtime: { destroyed: false } },
		{},
		null,
		{
			worldExperience: {
				canonicalPromotion: true,
				postPlayTerrainHydration: true,
				richRenderer: true
			}
		},
		new Promise(() => {}),
		{
			loadPolicy: async () => ({
				startEretzRendererByWorldPolicy() {
					events.push('renderer');
					return 'ready';
				}
			}),
			nextFrame: async () => events.push('frame')
		}
	);
	assert.equal(result, 'ready');
	assert.deepEqual(events, ['renderer']);
});

test('serialization requires terrain, rich renderer, and a simple-world policy together', () => {
	assert.equal(shouldSerializeEretzVisualPromotion({
		worldExperience: { canonicalPromotion: false, postPlayTerrainHydration: true, richRenderer: true }
	}), true);
	assert.equal(shouldSerializeEretzVisualPromotion({
		worldExperience: { canonicalPromotion: true, postPlayTerrainHydration: true, richRenderer: true }
	}), false);
	assert.equal(shouldSerializeEretzVisualPromotion({
		worldExperience: { canonicalPromotion: false, postPlayTerrainHydration: false, richRenderer: true }
	}), false);
	assert.equal(shouldSerializeEretzVisualPromotion({
		worldExperience: { canonicalPromotion: false, postPlayTerrainHydration: true, richRenderer: false }
	}), false);
});
