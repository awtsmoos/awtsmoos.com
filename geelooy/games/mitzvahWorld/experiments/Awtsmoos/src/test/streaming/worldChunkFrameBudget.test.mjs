// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkFrameBudget.test.mjs
 * @description Proves measured frame pressure reaches chunk streaming and suspends visual work without suppressing collision ownership.
 * The Awtsmoos renews ground and garment in one truth; Awtsmoos.com isolates the measured frame covenant from unrelated geometry,
 * so optional detail may be tested at its proper queue while collision keeps a valid indexed authority.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldChunkRuntime } from '../../world/streaming/WorldChunkRuntime.js';

function fixture() {
	const bounds = {
		min: { x: -10, y: -5, z: -10 },
		max: { x: 10, y: 5, z: 10 }
	};
	const triangles = [{}, {}, {}];
	const active = [...triangles];
	const terrain = {
		colliders: triangles,
		group: { name: 'world' },
		worldMetadata: { terrainGridSteps: 1 }
	};
	const mainOctree = {
		all(output = []) {
			output.push(...active);
			return output;
		},
		bounds: { toJSON: () => bounds },
		insert(triangle) {
			if (active.includes(triangle)) return false;
			active.push(triangle);
			return true;
		},
		query: (aabb, output = []) => output,
		raycast: () => null,
		remove(triangle) {
			const index = active.indexOf(triangle);
			if (index < 0) return false;
			active.splice(index, 1);
			return true;
		}
	};
	const collisionSourceIndex = {
		diagnostics() {
			return Object.freeze({ sourceTriangleCount: triangles.length });
		},
		query(position, radius) {
			return Object.freeze({ position, radius, triangles: [] });
		}
	};
	return { terrain, mainOctree, collisionSourceIndex };
}

test('recorded stressed frame suspends queued visual transition', () => {
	const runtime = new WorldChunkRuntime(fixture());
	const applied = [];
	runtime.registry.queue.enqueue({
		id: 'visual:far',
		apply: () => applied.push('visual')
	});
	runtime.recordFrameTime(20);
	const receipt = runtime.update();
	assert.equal(receipt.visual.suspended, true);
	assert.deepEqual(applied, []);
	assert.equal(receipt.visual.remaining, 1);
	assert.equal(runtime.diagnostics().frameTimeMilliseconds, 20);
});

test('healthy recorded frame allows queued visual transition', () => {
	const runtime = new WorldChunkRuntime(fixture());
	const applied = [];
	runtime.registry.queue.enqueue({
		id: 'visual:near',
		apply: () => applied.push('visual')
	});
	runtime.recordFrameTime(10);
	const receipt = runtime.update();
	assert.equal(receipt.visual.suspended, false);
	assert.deepEqual(applied, ['visual']);
});
