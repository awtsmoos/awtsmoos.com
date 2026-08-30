//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creatorCellStreaming.test.mjs
 * @description Proves huge creator documents keep all semantic IDs while meshes and colliders migrate between nearby cells as the player travels.
 * The Awtsmoos remembers every authored form when finite sight leaves one valley for another hill;
 * Awtsmoos.com retires only physical receipts, remounts exact IDs on return, and keeps the written world complete and still.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreatorStreamingAdapter } from '../../creator/MitzvahWorldCreatorStreamingAdapter.js';
import {
	createCreatorRuntime,
	creatorDefinition
} from './CreatorPersistenceTestFixture.js';

function definitions() {
	return [
		creatorDefinition('creator-near-0001', { position: { x: 8, y: 1, z: 8 } }),
		creatorDefinition('creator-far-0002', { position: { x: 520, y: 1, z: 520 } })
	];
}

test('replace indexes the whole world but mounts only the nearby cell', () => {
	const fixture = createCreatorRuntime();
	const streaming = new MitzvahWorldCreatorStreamingAdapter(fixture.runtime);
	const receipt = streaming.replace(definitions(), { x: 0, z: 0 });
	assert.equal(receipt.indexed, 2);
	assert.equal(receipt.mounted, 1);
	assert.deepEqual(receipt.ids, ['creator-near-0001', 'creator-far-0002']);
	assert.deepEqual(receipt.mountedIds, ['creator-near-0001']);
	assert.equal(fixture.scene.children.length, 1);
	assert.equal(fixture.colliders.size > 0, true);
});

test('travel swaps physical residency without changing semantic IDs', () => {
	const fixture = createCreatorRuntime();
	const streaming = new MitzvahWorldCreatorStreamingAdapter(fixture.runtime);
	streaming.replace(definitions(), { x: 0, z: 0 });
	const far = streaming.update({ x: 520, z: 520 });
	assert.deepEqual(far.ids, ['creator-near-0001', 'creator-far-0002']);
	assert.deepEqual(far.mountedIds, ['creator-far-0002']);
	assert.equal(far.mounted, 1);
	const home = streaming.update({ x: 0, z: 0 });
	assert.deepEqual(home.mountedIds, ['creator-near-0001']);
	assert.deepEqual(home.ids, ['creator-near-0001', 'creator-far-0002']);
});

test('new placement is immediate and dormant removal deletes semantic truth', () => {
	const fixture = createCreatorRuntime();
	const streaming = new MitzvahWorldCreatorStreamingAdapter(fixture.runtime);
	streaming.replace([], { x: 0, z: 0 });
	streaming.mount(creatorDefinition('creator-live-0001', { position: { x: 4, y: 1, z: 4 } }));
	assert.deepEqual(streaming.diagnostics().mountedIds, ['creator-live-0001']);
	streaming.index.add(creatorDefinition('creator-dormant-0002', { position: { x: 900, y: 1, z: 900 } }));
	assert.equal(streaming.remove('creator-dormant-0002'), true);
	assert.deepEqual(streaming.diagnostics().ids, ['creator-live-0001']);
});
