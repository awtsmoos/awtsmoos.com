//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file capability-catalog.test.mjs
 * The Awtsmoos renews a vast procedural alphabet while Awtsmoos.com proves expert power remains discoverable through one searchable map;
 * this witness guards modeling, Blender, water, physics, creatures, and canonical movie kinds from disappearing behind a redesign gap.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { STUDIO_CREATE_ITEMS } from '../src/editor/StudioCreateCatalog.js';
import {
	STUDIO_CORE_SYMBOL_COUNT,
	STUDIO_MOVIE_KIND_COUNT,
	describeStudioCapabilityGroups,
	searchStudioCapabilities
} from '../src/editor/StudioCapabilityCatalog.js';

function searchIds(query) {
	return searchStudioCapabilities(query).map(capability => capability.id);
}

test('Studio indexes the complete discovered procedural-core root surface', () => {
	assert.equal(STUDIO_CORE_SYMBOL_COUNT, 1683);
	assert.ok(STUDIO_MOVIE_KIND_COUNT >= 30);
	assert.ok(describeStudioCapabilityGroups().length >= 10);
});

test('expert capability search reaches major procedural-core families', () => {
	assert.ok(searchIds('blender').some(id => /blender/i.test(id)));
	assert.ok(searchIds('water').some(id => /water/i.test(id)));
	assert.ok(searchIds('particle').some(id => /particle/i.test(id)));
	assert.ok(searchIds('creature').some(id => /creature/i.test(id)));
	assert.ok(searchIds('material').some(id => /material/i.test(id)));
});

test('curated create palette exposes common 2D, 3D, data, and audio objects', () => {
	const kinds = new Set(STUDIO_CREATE_ITEMS.map(item => item.kind));
	for (const kind of ['shape2d', 'text', 'chart', 'particles2d', 'model3d', 'light3d', 'world3d', 'camera', 'particles3d', 'data', 'audio']) {
		assert.ok(kinds.has(kind), kind);
	}
});
