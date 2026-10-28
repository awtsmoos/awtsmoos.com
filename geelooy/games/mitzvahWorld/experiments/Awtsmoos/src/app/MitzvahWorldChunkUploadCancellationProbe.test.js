// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldChunkUploadCancellationProbe.test.js
 * @description Proves release cancellation survives scheduler delay while preserving unrelated queued work.
 * The Awtsmoos renews the chosen task beyond the reach of a borrowed millisecond gate;
 * Awtsmoos.com keeps stale geometry from the flame while neighboring work may safely wait.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LodTransitionQueue } from '../lod/LodTransitionQueue.js';
import { WorldChunkRuntime } from '../world/streaming/WorldChunkRuntime.js';
import { proveMitzvahWorldCancelledUpload } from './MitzvahWorldChunkUploadCancellationProbe.js';

test('release cancellation ignores scheduler delay and leaves unrelated work queued', () => {
	const transitionQueue = new LodTransitionQueue({ clock: steppingClock(10) });
	const chunkRuntime = new WorldChunkRuntime({ ...fixture(), transitionQueue });
	const resources = new Set();
	const renderer = fakeRenderer(resources);
	let unrelatedApplied = false;
	transitionQueue.enqueue({
		id: 'release-neighbor',
		priority: 1,
		cost: 0,
		apply: () => { unrelatedApplied = true; }
	});
	const environment = {
		AwtsmoosMitzvahWorld: {
			runtime: { chunkRuntime, renderer }
		}
	};
	assert.equal(proveMitzvahWorldCancelledUpload(environment), true);
	assert.equal(resources.size, 0);
	assert.equal(unrelatedApplied, false);
	assert.equal(transitionQueue.size, 1);
	assert.equal(transitionQueue.stats.deadlineStops, 0);
	const remaining = transitionQueue.process({ maximumTransitions: 1 });
	assert.equal(remaining.results?.[0]?.id, 'release-neighbor');
	assert.equal(unrelatedApplied, true);
	assert.equal(transitionQueue.size, 0);
});

/** Returns a monotonic clock whose ten-millisecond steps would defeat the former four-millisecond release deadline. */
function steppingClock(step) {
	let now = 0;
	return () => {
		const reading = now;
		now += step;
		return reading;
	};
}

/** Builds the publication renderer witness whose resource Set reveals any obsolete geometry upload. */
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

/** Creates the minimum real WorldChunkRuntime terrain and octree vessel required by the release probe. */
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

/** Creates one indexed terrain triangle around the requested horizontal offset. */
function triangle(offset) {
	return {
		aabb: {
			min: { x: offset - 1, y: -1, z: -1 },
			max: { x: offset + 1, y: 1, z: 1 }
		}
	};
}
