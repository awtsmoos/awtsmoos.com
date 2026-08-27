// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deferredVillageBotanicalEnrichment.test.mjs
 * @description Proves optional botany never blocks movement and never installs twice.
 * The Awtsmoos reveals every petal at its proper time; Awtsmoos.com protects the living
 * scene from duplicate growth, stale promises, and geometry arriving after destruction.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	DeferredVillageBotanicalEnrichment
} from '../../world/streaming/DeferredVillageBotanicalEnrichment.js';

test('start schedules once and installs visual batches exactly once', async () => {
	const fixture = createFixture();
	const firstPromise = fixture.enrichment.start();
	const secondPromise = fixture.enrichment.start();

	assert.equal(firstPromise, secondPromise);
	assert.equal(fixture.scheduled.length, 1);
	assert.equal(fixture.enrichment.snapshot().state, 'scheduled');

	fixture.scheduled[0]();
	const result = await firstPromise;

	assert.equal(fixture.loaderCalls.length, 1);
	assert.deepEqual(fixture.group.children.map((mesh) => mesh.id), ['flowers-a', 'flowers-b']);
	assert.equal(result.state, 'complete');
	assert.equal(result.installedMeshes, 2);
	assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
});

test('destroy before import resolution rejects stale geometry', async () => {
	let resolveLoader;
	const loaderPromise = new Promise((resolve) => {
		resolveLoader = resolve;
	});
	const fixture = createFixture({ loader: () => loaderPromise });
	const completion = fixture.enrichment.start();
	fixture.scheduled[0]();
	fixture.enrichment.destroy();
	resolveLoader(createModule());
	const result = await completion;

	assert.equal(result.state, 'destroyed');
	assert.equal(result.installedMeshes, 0);
	assert.deepEqual(fixture.group.children, []);
});

test('destroy removes already installed meshes', async () => {
	const fixture = createFixture();
	const completion = fixture.enrichment.start();
	fixture.scheduled[0]();
	await completion;
	fixture.enrichment.destroy();

	assert.equal(fixture.enrichment.snapshot().state, 'destroyed');
	assert.deepEqual(fixture.group.children, []);
});

function createFixture(overrides = {}) {
	const scheduled = [];
	const loaderCalls = [];
	const group = createGroup();
	const selectedLoader = overrides.loader || (async () => createModule());
	const enrichment = new DeferredVillageBotanicalEnrichment({
		group,
		groundSampler: () => 0,
		loader: async () => {
			loaderCalls.push('load');
			return selectedLoader();
		},
		meshFactory: (definition) => ({ id: definition.id }),
		quality: 'medium',
		schedule: (callback) => scheduled.push(callback) - 1
	});
	return { enrichment, group, loaderCalls, scheduled };
}

function createGroup() {
	return {
		children: [],
		add(mesh) {
			this.children.push(mesh);
		},
		remove(mesh) {
			const index = this.children.indexOf(mesh);
			if (index >= 0) this.children.splice(index, 1);
		}
	};
}

function createModule() {
	return {
		createVillageBotanicalEnrichmentDefinitions() {
			return {
				definitions: [{ id: 'flowers-a' }, { id: 'flowers-b' }],
				stats: { batches: 2, visualOnly: true }
			};
		}
	};
}
