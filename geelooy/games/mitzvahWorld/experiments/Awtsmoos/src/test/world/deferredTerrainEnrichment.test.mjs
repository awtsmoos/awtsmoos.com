// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deferredTerrainEnrichment.test.mjs
 * @description Proves collision precedes streamed terrain visuals and stale work cannot manifest.
 * The Awtsmoos gives every trunk and carved letter a truthful boundary before appearance;
 * Awtsmoos.com preserves order, exactly-once work, cancellation, and reversible enrichment.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	DeferredTerrainEnrichment
} from '../../world/streaming/DeferredTerrainEnrichment.js';

test('text collision precedes text, forest input, forest collision, and forest visuals', async () => {
	const fixture = createFixture();
	const first = fixture.enrichment.start();
	const second = fixture.enrichment.start();

	assert.equal(first, second);
	assert.equal(fixture.scheduled.length, 1);
	fixture.scheduled[0]();
	const snapshot = await first;

	assert.deepEqual(fixture.events, [
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
	assert.equal(snapshot.collision.insertedColliders, 2);
	assert.deepEqual(JSON.parse(JSON.stringify(snapshot)), snapshot);
});

test('destroy before text module resolution prevents all installation', async () => {
	let resolveText;
	const textPromise = new Promise((resolve) => {
		resolveText = resolve;
	});
	const fixture = createFixture({ loadText: () => textPromise });
	const completion = fixture.enrichment.start();
	fixture.scheduled[0]();
	fixture.enrichment.destroy();
	resolveText(fixture.textModule);
	const snapshot = await completion;

	assert.equal(snapshot.state, 'destroyed');
	assert.deepEqual(fixture.events, ['load:text']);
	assert.deepEqual(fixture.colliderStore, []);
	assert.deepEqual(fixture.forest.children, []);
	assert.deepEqual(fixture.text.children, []);
});

test('destroy after completion removes visuals, collision, and obstacle additions', async () => {
	const fixture = createFixture();
	const completion = fixture.enrichment.start();
	fixture.scheduled[0]();
	await completion;
	fixture.enrichment.destroy();

	assert.deepEqual(fixture.colliderStore, []);
	assert.deepEqual(fixture.obstacleTriangles, []);
	assert.deepEqual(fixture.forest.children, []);
	assert.deepEqual(fixture.text.children, []);
	assert.equal(fixture.enrichment.snapshot().state, 'destroyed');
	assert.deepEqual(fixture.removed, ['forest-collider', 'text-collider']);
});

function createFixture(overrides = {}) {
	const events = [];
	const removed = [];
	const scheduled = [];
	const colliderStore = [];
	const obstacleTriangles = [];
	const textCollider = createCollider('text-collider');
	const forestCollider = createCollider('forest-collider');
	const text = createGroup('text', events);
	const forest = createGroup('forest', events);
	const textModule = {
		async createProceduralTextLandmark() {
			events.push('generate:text');
			return createTextPackage(textCollider);
		}
	};
	const forestOptions = {};
	const forestModule = {
		createProceduralForest(options) {
			Object.assign(forestOptions, options);
			events.push('generate:forest');
			return createForestPackage(forestCollider);
		}
	};
	const context = {
		colliderStore,
		forest: createForestFacade(forest),
		groundSampler: () => 0,
		halfSize: 120,
		obstacleTriangles,
		quality: 'medium',
		roadTriangles: [],
		textLandmark: createTextFacade(text)
	};
	const octree = {
		insert(collider) {
			events.push(`collision:${collider.id}`);
			return true;
		},
		remove(collider) {
			removed.push(collider.id);
			return true;
		}
	};
	const loadText = overrides.loadText || (async () => textModule);
	const enrichment = new DeferredTerrainEnrichment({
		context,
		loadForest: async () => {
			events.push('load:forest');
			return forestModule;
		},
		loadText: async () => {
			events.push('load:text');
			return loadText();
		},
		octree,
		schedule: (callback) => scheduled.push(callback) - 1
	});
	return {
		colliderStore,
		enrichment,
		events,
		forest,
		forestOptions,
		obstacleTriangles,
		removed,
		scheduled,
		text,
		textCollider,
		textModule
	};
}

function createGroup(name, events) {
	return {
		children: [],
		add(child) {
			this.children.push(child);
			events.push(`visual:${child.id}`);
		},
		remove(child) {
			const index = this.children.indexOf(child);
			if (index >= 0) this.children.splice(index, 1);
		},
		name
	};
}

function createForestFacade(group) {
	return {
		colliders: [],
		group,
		records: [],
		stats: { rendering: {}, unsupported: {} }
	};
}

function createTextFacade(mesh) {
	return { artifact: null, colliders: [], definition: null, mesh, stats: {} };
}

function createTextPackage(collider) {
	return {
		artifact: { id: 'artifact' },
		colliders: [collider],
		definition: { id: 'definition' },
		mesh: { id: 'text-visual' },
		stats: { colliders: 1 }
	};
}

function createForestPackage(collider) {
	return {
		colliders: [collider],
		group: { id: 'forest-visual' },
		records: [{ id: 'tree-1' }],
		stats: {
			drawCalls: 2,
			mobilePolicy: 'bounded',
			unsupported: { wind: 'disabled' }
		}
	};
}

function createCollider(id) {
	return { id };
}
