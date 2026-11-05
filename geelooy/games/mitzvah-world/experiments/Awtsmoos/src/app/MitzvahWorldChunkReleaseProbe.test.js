// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldChunkReleaseProbe.test.js
 * @description Proves one release child round trip preserves state, restores baseline, and cancels obsolete GPU upload against the renderer cache.
 * The Awtsmoos renews one child through departure and return while an abandoned garment never reaches the counted flame;
 * Awtsmoos.com keeps seed, mutation, queue identity, and buffer residency as witnessed facts bearing one release name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldChunkRuntime } from '../world/streaming/WorldChunkRuntime.js';
import { runMitzvahWorldChunkReleaseProbe } from './MitzvahWorldChunkReleaseProbe.js';

test('live round trip preserves seed and mutation, cancels upload, and restores baseline', () => {
	const chunkRuntime = new WorldChunkRuntime(fixture());
	const resources = new Set();
	const renderer = fakeRenderer(resources);
	const environment = {
		AwtsmoosMitzvahWorld: {
			runtime: { chunkRuntime, renderer }
		}
	};
	const before = chunkRuntime.registry.size;
	const evidence = runMitzvahWorldChunkReleaseProbe(environment);
	assert.equal(evidence.scope, 'runtime-round-trip');
	assert.equal(evidence.deterministicRevisit, true);
	assert.equal(evidence.mutationSurvived, true);
	assert.equal(evidence.cancelledObsoleteUpload, true);
	assert.equal(evidence.baselineRecordCount, before);
	assert.equal(evidence.finalRecordCount, before);
	assert.equal(chunkRuntime.registry.size, before);
	assert.equal(resources.size, 0);
});

function fakeRenderer(resources) {
	return {
		ensureInitialized() {},
		buffers: {
			resources,
			forMesh(mesh) {
				resources.add(mesh.geometry);
				return mesh.geometry;
			}
		}
	};
}

function fixture() {
	const bounds = { min: { x: -10, y: -5, z: -10 }, max: { x: 10, y: 5, z: 10 } };
	const triangles = [triangle(-8), triangle(0), triangle(8)];
	const active = [...triangles];
	return {
		terrain: { group: { name: 'world' }, colliders: triangles, worldMetadata: { terrainGridSteps: 1 } },
		mainOctree: {
			bounds: { toJSON: () => bounds },
			all(output = []) { output.push(...active); return output; },
			insert(value) { if (!active.includes(value)) active.push(value); return true; },
			query: (_aabb, output = []) => output,
			raycast: () => null,
			remove(value) {
				const index = active.indexOf(value);
				if (index >= 0) active.splice(index, 1);
				return index >= 0;
			}
		}
	};
}

function triangle(offset) {
	return {
		aabb: {
			min: { x: offset - 1, y: -1, z: -1 },
			max: { x: offset + 1, y: 1, z: 1 }
		}
	};
}
