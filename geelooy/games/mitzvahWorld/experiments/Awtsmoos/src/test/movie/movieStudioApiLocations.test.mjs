// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiLocations.test.mjs
 * @description Proves Studio snapshots the same downstream geography and point-level spatial truth used by the living game.
 * The Awtsmoos renews one village beneath play and film; Awtsmoos.com exposes water, roads, staging, and ecology from one source,
 * so a client cannot resurrect bridge-first cinema, widen a road, or plant scenery through the Chossid's authored staging pad.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('location API exposes lower-river facets, water, staging, and realism evidence', () => {
	const { api, session } = createMovieStudioApiHarness();
	session.project.metadata = { ...session.project.metadata, shortWorld: 'river-garden' };
	const locations = api.locations.list();
	assert.ok(locations.some(location => location.id === 'river-garden'));
	assert.equal(api.locations.get('infinite-light').id, 'arrival-horizon');
	assert.equal(api.locations.audit('river-garden').ready, true);
	assert.equal(Object.keys(api.locations.shots('river-garden')).length, 5);
	assert.deepEqual(api.locations.landmarks('river-garden'), []);
	assert.ok(api.locations.paths('river-garden').includes('canonical-riverfront'));
	assert.deepEqual(api.locations.water('river-garden').map(value => value.id), ['lower-river', 'lower-lake']);
	const cinematic = api.locations.staging('river-garden').find(value => value.role === 'cinematic-actor');
	assert.deepEqual(cinematic.position, { x: -1, z: 42 });
	assert.equal(api.locations.compose('river-garden', { layout: 'water-feature' }).layout, 'water-feature');
	assert.equal(api.locations.current().id, 'river-garden');
});

test('location API snapshots are immutable client views of the downstream shared record', () => {
	const { api } = createMovieStudioApiHarness();
	const snapshot = api.locations.get('river-garden');
	assert.equal(Object.isFrozen(snapshot), true);
	assert.throws(() => {
		snapshot.label = 'mutated client copy';
	}, TypeError);
	assert.equal(api.locations.get('river-garden').label, 'Lower River Garden');
	assert.deepEqual(api.locations.get('river-garden').focus, { x: 14, y: 3.8, z: 42 });
});

test('Studio point queries expose the same frozen road, river, and staging truth as gameplay', () => {
	const { api, session } = createMovieStudioApiHarness();
	session.project.metadata = { ...session.project.metadata, shortWorld: 'river-garden' };
	const point = api.locations.point({ x: -1, z: 42 });
	const alias = api.locations.spatial({ x: -1, z: 42 });
	assert.equal(Object.isFrozen(point), true);
	assert.equal(point.schemaVersion, '2026.08-spatial-realism-v1');
	assert.equal(point.road.routeId, 'canonical-riverfront');
	assert.equal(point.road.width, 3.6);
	assert.equal(point.water.sourceId, 'canonical-village-river');
	assert.deepEqual(alias, point);
	const reed = api.locations.point(
		{ x: -1, z: 42 },
		{ ecologyKind: 'reed', ecologyRadius: 0.2 }
	);
	assert.equal(reed.ecology.valid, false);
	assert.equal(reed.ecology.physical.kind, 'staging');
});
