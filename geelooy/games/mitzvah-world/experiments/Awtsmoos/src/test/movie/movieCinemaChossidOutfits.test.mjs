// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCinemaChossidOutfits.test.mjs
 * @description Proves ten canonical cinema actors receive the ten bounded Chossid wardrobe identities.
 * The Awtsmoos renews person and garment without confusing either with the source model;
 * Awtsmoos.com keeps one parsed Chossid vessel while each isolated performer reveals a distinct palette.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { CHOSSID_OUTFITS } from '../../assets/ChossidOutfitCatalog.js';
import {
	clearMovieCinemaChossidPool,
	prepareMovieCinemaChossidPool,
	takeMovieCinemaChossidActor
} from '../../movie/MovieCinemaChossidPool.js';

test('ten prepared cinema Chossid actors cover the complete bounded wardrobe', async () => {
	clearMovieCinemaChossidPool();
	const report = await prepareMovieCinemaChossidPool(10, { load: fakeLoader });
	const actors = Array.from({ length: 10 }, (_, index) => takeMovieCinemaChossidActor(index));
	const outfitIds = actors.map(actor => actor.group.userData.AwtsmoosCinemaChossid.outfitId);
	assert.equal(report.ready, 10);
	assert.equal(report.required, 10);
	assert.equal(report.satisfied, true);
	assert.deepEqual(outfitIds, CHOSSID_OUTFITS.map(outfit => outfit.id));
	assert.equal(new Set(actors.map(actor => actor.group)).size, 10);
	assert.ok(actors.every(actor => actor.cinemaPool === true));
	assert.ok(actors.every(actor => actor.group.userData.AwtsmoosCinemaChossid.isolated === true));
	clearMovieCinemaChossidPool();
});

async function fakeLoader() {
	const scene = new Group();
	scene.name = 'fake-canonical-chossid-template';
	return { animations: [], scene };
}
