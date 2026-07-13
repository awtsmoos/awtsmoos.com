// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionRuntime.test.mjs
 * @description Proves bootstrap ownership and the accepted active-query vessel.
 * The Awtsmoos sustains one original ground while future children wait; Awtsmoos.com
 * exposes that same octree through canonical ownership diagnostics and query revision.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapWorldChunk } from '../../world/streaming/WorldChunkBootstrap.js';
import { WorldChunkCollisionRuntime } from '../../world/streaming/WorldChunkCollisionRuntime.js';
import {
	collisionBounds,
	collisionOctree
} from './WorldChunkCollisionTestFixture.mjs';

function fixture() {
	const bounds = collisionBounds({ minimum: -20, maximum: 20 });
	const mainOctree = collisionOctree({ bounds, triangleCount: 11 });
	const terrain = {
		group: { name: 'bootstrap-terrain' },
		colliders: mainOctree.all()
	};
	const bootstrapRecord = createBootstrapWorldChunk({ terrain, mainOctree });
	return { bounds, mainOctree, bootstrapRecord };
}

test('runtime registers bootstrap octree and creates one query facade', () => {
	const { bounds, mainOctree, bootstrapRecord } = fixture();
	const runtime = new WorldChunkCollisionRuntime({
		bootstrapRecord,
		mainOctree
	});
	assert.equal(runtime.bootstrapEntry.chunkId, bootstrapRecord.id);
	assert.equal(runtime.bootstrapEntry.runtime.octree, mainOctree);
	assert.deepEqual(runtime.bootstrapEntry.bounds, bounds);
	assert.equal(runtime.bootstrapEntry.triangleCount, 11);
	assert.equal(runtime.query.index, runtime.index);
	assert.deepEqual(runtime.query.diagnostics().ownerIds, [bootstrapRecord.id]);
});

test('runtime diagnostics expose ownership and query revision together', () => {
	const { mainOctree, bootstrapRecord } = fixture();
	const runtime = new WorldChunkCollisionRuntime({
		bootstrapRecord,
		mainOctree
	});
	const diagnostics = runtime.diagnostics();
	assert.equal(diagnostics.bootstrapId, bootstrapRecord.id);
	assert.equal(diagnostics.active, 1);
	assert.equal(diagnostics.prepared, 0);
	assert.equal(diagnostics.validated, 0);
	assert.equal(diagnostics.activeTriangles, 11);
	assert.deepEqual(diagnostics.query.ownerIds, [bootstrapRecord.id]);
	assert.match(diagnostics.query.revision, new RegExp(bootstrapRecord.id));
	assert.equal(diagnostics.lastHandoff, null);
	assert.equal(diagnostics.lastDiscard, null);
});

test('runtime rejects incomplete bootstrap ownership inputs', () => {
	const { mainOctree } = fixture();
	assert.throws(
		() => new WorldChunkCollisionRuntime({ mainOctree }),
		/Bootstrap chunk record/
	);
});
