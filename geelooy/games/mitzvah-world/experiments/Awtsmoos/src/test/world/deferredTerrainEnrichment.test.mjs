// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deferredTerrainEnrichment.test.mjs
 * @description Proves current fauna-text-forest priority, exact cancellation, collision order, and reversible enrichment.
 * The Awtsmoos gives creature, letter, and tree their truthful hour before appearance;
 * Awtsmoos.com preserves one generation, clean collision, exact teardown, and a world that can disappear without residue.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createDeferredTerrainFixture } from './support/DeferredTerrainEnrichmentFixture.mjs';

test('fauna precedes text collision, text visual, forest collision, and forest visual', async () => {
	const fixture = createDeferredTerrainFixture();
	const first = fixture.enrichment.start();
	const second = fixture.enrichment.start();
	assert.equal(first, second);
	assert.equal(fixture.scheduled.length, 1);
	fixture.scheduled[0]();
	const snapshot = await first;
	assert.deepEqual(fixture.events, [
		'load:fauna',
		'generate:fauna',
		'visual:fauna-visual',
		'load:text',
		'generate:text',
		'collision:text-collider',
		'visual:text-visual',
		'load:forest',
		'generate:forest',
		'collision:forest-collider',
		'visual:forest-visual'
	]);
	assert.equal(fixture.forestOptions.obstacleTriangles.includes(fixture.textCollider), true);
	assert.equal(snapshot.state, 'complete');
	assert.equal(snapshot.features.faunaInstalled, true);
	assert.equal(snapshot.features.faunaCreatures, 2);
	assert.equal(snapshot.collision.insertedColliders, 2);
	assert.deepEqual(JSON.parse(JSON.stringify(snapshot)), snapshot);
});

test('destroy before fauna module resolution prevents every installation', async () => {
	let resolveFauna;
	const faunaPromise = new Promise(resolve => {
		resolveFauna = resolve;
	});
	const fixture = createDeferredTerrainFixture({ loadFauna: () => faunaPromise });
	const completion = fixture.enrichment.start();
	fixture.scheduled[0]();
	fixture.enrichment.destroy();
	resolveFauna(fixture.faunaModule);
	const snapshot = await completion;
	assert.equal(snapshot.state, 'destroyed');
	assert.deepEqual(fixture.events, ['load:fauna']);
	assert.deepEqual(fixture.colliderStore, []);
	assert.deepEqual(fixture.root.children, []);
	assert.deepEqual(fixture.forest.children, []);
	assert.deepEqual(fixture.text.children, []);
});

test('destroy after completion removes fauna, visuals, collision, and obstacle additions', async () => {
	const fixture = createDeferredTerrainFixture();
	const completion = fixture.enrichment.start();
	fixture.scheduled[0]();
	await completion;
	fixture.enrichment.destroy();
	assert.deepEqual(fixture.colliderStore, []);
	assert.deepEqual(fixture.obstacleTriangles, []);
	assert.deepEqual(fixture.root.children, []);
	assert.deepEqual(fixture.forest.children, []);
	assert.deepEqual(fixture.text.children, []);
	assert.equal(fixture.enrichment.snapshot().state, 'destroyed');
	assert.deepEqual(fixture.removed, ['forest-collider', 'text-collider']);
});
