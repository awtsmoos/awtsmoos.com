//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file eretzVisualPromotionSequence.test.mjs
 * @description Proves required authored visuals outrank broad optional post-play work without blocking on remote terrain downloads.
 * The Awtsmoos lets Awtsmoos.com start earth's garment, return one frame to motion, and awaken the true renderer;
 * distant enrichment may arrive later, but it may never hold the Chossid or meadow hostage behind its module graph.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	shouldSerializeEretzVisualPromotion,
	startEretzVisualPromotionSequence
} from '../../app/EretzVisualPromotionSequence.js';

const OPTIONS = Object.freeze({
	worldExperience: Object.freeze({
		canonicalPromotion: false,
		postPlayTerrainHydration: true,
		richRenderer: true
	})
});

test('Blank Meadow starts terrain, yields, then promotes renderer without awaiting terrain completion', async () => {
	const events = [];
	const neverSettles = new Promise(() => {});
	const result = await startEretzVisualPromotionSequence(
		{ runtime: { destroyed: false } },
		{},
		null,
		OPTIONS,
		{ terrain: {} },
		{
			startTerrainHydration() {
				events.push('terrain-start');
				return neverSettles;
			},
			nextFrame: async () => events.push('frame'),
			loadPolicy: async () => ({
				startEretzRendererByWorldPolicy() {
					events.push('renderer');
					return 'ready';
				}
			})
		}
	);
	assert.equal(result, 'ready');
	assert.deepEqual(events, ['terrain-start', 'frame', 'renderer']);
});

test('rich worlds skip the serialized terrain handoff and enter renderer policy directly', async () => {
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
		{ terrain: {} },
		{
			startTerrainHydration: () => events.push('terrain-start'),
			nextFrame: async () => events.push('frame'),
			loadPolicy: async () => ({
				startEretzRendererByWorldPolicy() {
					events.push('renderer');
					return 'ready';
				}
			})
		}
	);
	assert.equal(result, 'ready');
	assert.deepEqual(events, ['renderer']);
});

test('serialization requires terrain, rich renderer, and a simple-world policy together', () => {
	assert.equal(shouldSerializeEretzVisualPromotion(OPTIONS), true);
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

test('runtime gives required visual promotion priority over the broad optional coordinator', async () => {
	const source = await readFile(new URL('../../app/createEretzRuntime.js', import.meta.url), 'utf8');
	const publish = source.indexOf('publishRuntime(core.diagnostics, environment)');
	const visual = source.indexOf('const visuals = startVisualPromotionAfterPlay(');
	const optional = source.indexOf('startPostPlayableAfterRequiredVisuals(');
	assert.ok(publish >= 0);
	assert.ok(visual > publish);
	assert.ok(optional > visual);
	assert.match(source, /core\.foundation/);
	assert.match(source, /Promise\.resolve\(visualPromise\)/);
});
