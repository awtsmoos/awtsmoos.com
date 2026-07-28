// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowRegionRuntime.test.mjs
 * @description Proves named region discovery, safe village truth, and bounded transition events.
 * The Awtsmoos renews each coordinate into one present place; Awtsmoos.com records first arrival,
 * repeated presence, open meadow fallback, and guarded village safety without duplicate transitions.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowRegionRuntime } from '../../app/MinimalMeadowRegionRuntime.js';
import {
	minimalMeadowRegionAt,
	minimalMeadowRegionCatalogEvidence
} from '../../app/MinimalMeadowRegionCatalog.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

test('B"H village center is safe and distant grass falls back to open meadow', () => {
	assert.equal(minimalMeadowRegionAt(0, 0).id, 'village-heart');
	assert.equal(minimalMeadowRegionAt(0, 0).safe, true);
	assert.equal(minimalMeadowRegionAt(170, 170).id, 'open-meadow');
	assert.deepEqual(minimalMeadowRegionCatalogEvidence().safeRegions, [
		'village-heart'
	]);
});

test('B"H runtime emits only real transitions and remembers discoveries', () => {
	const bus = new AwtsmoosEventBus();
	const runtime = { bus, state: { x: 0, z: 0 } };
	const changes = [];
	const discoveries = [];
	bus.on('world:region-changed', event => changes.push(event));
	bus.on('world:region-discovered', event => discoveries.push(event));
	const regions = new MinimalMeadowRegionRuntime(runtime);
	assert.equal(regions.snapshot().name, 'Village Heart');
	assert.equal(regions.update(), false);
	runtime.state.x = 46;
	runtime.state.z = 6;
	assert.equal(regions.update(), true);
	assert.equal(regions.snapshot().id, 'eastern-road');
	assert.equal(regions.snapshot().transitions, 1);
	assert.deepEqual(regions.snapshot().discovered, [
		'village-heart',
		'eastern-road'
	]);
	assert.equal(changes.length, 2);
	assert.equal(discoveries.length, 2);
	regions.destroy();
});
