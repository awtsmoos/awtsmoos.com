// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCinemaChossidPool.test.mjs
 * @description Proves final humans come from prepared isolated Chossid GLB actors and never procedural boxes.
 * The Awtsmoos renews one canonical source and many intact vessels; Awtsmoos.com verifies
 * borrowed skeleton-safe performers appear synchronously at runtime and missing preparation fails loudly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	clearMovieCinemaChossidPool,
	movieCinemaChossidPoolSnapshot,
	prepareMovieCinemaChossidPool
} from '../../movie/MovieCinemaChossidPool.js';
import { createMovieCrowdActor } from '../../movie/MovieCrowdActorSource.js';

const CHARACTER = Object.freeze({
	friendlyNpcIndex: 0,
	id: 'pool-chossid',
	label: 'Prepared Chossid',
	source: 'friendlyNpc',
	visible: true
});

test('prepared isolated Chossid becomes a borrowed final actor', async () => {
	clearMovieCinemaChossidPool();
	const report = await prepareMovieCinemaChossidPool(2, { load: fakeLoader });
	assert.equal(report.ready, 2);
	assert.equal(report.satisfied, true);
	assert.equal(movieCinemaChossidPoolSnapshot(2).model, 'assets/models/player/chossid.glb');
	const runtime = { friendlyNpcs: { actors: [] }, scene: new Scene() };
	const record = createMovieCrowdActor(runtime, CHARACTER, 0);
	assert.equal(record.borrowed, true);
	assert.equal(record.actor.cinemaPool, true);
	assert.equal(record.figure.parent, runtime.scene);
	assert.equal(record.figure.userData.AwtsmoosMovieCharacter.borrowedSharedChossid, true);
	assert.equal(record.figure.userData.AwtsmoosMovieCharacter.canonicalModel, 'assets/models/player/chossid.glb');
	assert.equal(record.figure.scale.x, record.figure.scale.y);
	assert.equal(record.figure.scale.y, record.figure.scale.z);
	clearMovieCinemaChossidPool();
});

test('friendlyNpc source refuses a procedural final-human fallback', () => {
	clearMovieCinemaChossidPool();
	const runtime = { friendlyNpcs: { actors: [] }, scene: new Scene() };
	assert.throws(
		() => createMovieCrowdActor(runtime, CHARACTER, 0),
		error => error.code === 'CINEMA_CHOSSID_ASSET_UNAVAILABLE'
	);
});

async function fakeLoader() {
	const scene = new Group();
	scene.name = 'fake-canonical-chossid';
	return { animations: [], scene };
}
