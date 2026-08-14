// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortHeroWorldDefinitions.test.mjs
 * @description Proves Shorts inherit lower-river focus, shared cinematic staging, dry west-bank lanes, and no synthetic scenery.
 * The Awtsmoos renews one village beneath play and film; Awtsmoos.com tests shared geographic relationships,
 * so a river story cannot silently drift back toward bridge masonry or an obsolete actor coordinate.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	MOVIE_SHORT_RIVER_FOCUS,
	listMovieShortHeroWorlds,
	movieShortHeroWorldDefinition,
	resolveMovieShortHeroShot
} from '../movie/shorts/MovieShortHeroWorldDefinitions.js';

const directorUrl = new URL('../movie/shorts/MovieShortHeroWorldDirector.js', import.meta.url);

test('river-garden uses lower-river focus, shared cinematic staging, and distant west-bank lanes', () => {
	const definition = movieShortHeroWorldDefinition('river-garden');
	const cinematicPad = definition.staging.find(value => value.role === 'cinematic-actor');
	assert.deepEqual(MOVIE_SHORT_RIVER_FOCUS, { x: 14, y: 3.8, z: 42 });
	assert.deepEqual(definition.actor, cinematicPad.position);
	assert.deepEqual(definition.actor, { x: -1, z: 42 });
	assert.deepEqual(definition.camera.position, { x: -20, y: 8, z: 48 });
	assert.equal(definition.camera.fieldOfView, 50);
	assert.deepEqual(definition.requiredSystems, ['authored-terrain', 'real-nature']);
	assert.ok(definition.worldRoles.includes('terrain'));
	assert.ok(definition.worldRoles.includes('water'));
	const sideTrack = resolveMovieShortHeroShot(definition, 'sideTrack');
	assert.ok(sideTrack.from.x <= -13 && sideTrack.to.x <= -13);
	assert.ok(sideTrack.target.z >= 40);
	assert.equal(Object.keys(definition.shots).length, 5);
	assert.equal(listMovieShortHeroWorlds().length, 6);
});

test('custom authored camera and actor coordinates are accepted', () => {
	const definition = movieShortHeroWorldDefinition({
		actor: { x: 3, z: 8 }, anchor: { x: 4, y: 7, z: 9 }, label: 'Custom courtyard'
	});
	assert.deepEqual(definition.anchor, { x: 4, y: 7, z: 9 });
	assert.deepEqual(definition.actor, { x: 3, z: 8 });
	assert.equal(definition.label, 'Custom courtyard');
});

test('Short hero runtime contains no primitive mesh or synthetic color art', async () => {
	const source = await readFile(directorUrl, 'utf8');
	assert.doesNotMatch(source, /createPrimitiveMesh|new Group\(|MinimalMeadowWaterSystem/);
	assert.doesNotMatch(source, /fillStyle|#[0-9a-f]{3,8}/i);
});
