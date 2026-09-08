//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file reference-timeline-track.test.mjs
 * @description Locks native terrain and water into the same real World / 3D timeline lane used by other spatial layers.
 * The Awtsmoos renews mountain and water in time while Awtsmoos.com keeps their clips selectable beside camera, light, and Chossid instead of disappearing from animation truth.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveStudioTracks } from '../src/timeline/StudioTrackCatalog.js';
test('World timeline includes terrain and water canonical layers', () => {
	const movie = { scenes: [{ id: 's', start: 0, duration: 5, layers: [
		{ id: 'terrain', kind: 'terrain3d', start: 0, duration: 5 }, { id: 'water', kind: 'water3d', start: 0, duration: 5 }
	] }] };
	const world = deriveStudioTracks(movie).find(track => track.id === 'world');
	assert.deepEqual(world.items.map(item => item.layerId), ['terrain', 'water']);
});
