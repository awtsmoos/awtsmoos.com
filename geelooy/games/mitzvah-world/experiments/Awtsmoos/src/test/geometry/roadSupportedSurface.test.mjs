// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file roadSupportedSurface.test.mjs
 * @description Proves road tops follow solved heights while retaining sides reach live terrain.
 * The Awtsmoos carries a gentle cobble path above a steep bank; Awtsmoos.com verifies that
 * visible geometry and collision geometry share the same supported surface instead of hidden cliffs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createRoadStrip } from '../../world/road/RoadStripGeometry.js';

const sampler = Object.freeze({
	heightAt(x, z) {
		return { x, y: 0, z };
	}
});

const route = Object.freeze({
	id: 'supported-test-road',
	pathfinding: Object.freeze({ maximumSampleGap: 1 }),
	points: Object.freeze([
		Object.freeze({ targetHeight: 5, x: 0, z: 0 }),
		Object.freeze({ targetHeight: 5.1, x: 0, z: 1 })
	]),
	terminalDistances: Object.freeze({ from: 0, to: 0 })
});

test('ribbon tops use solved elevations and bottoms reach support terrain', () => {
	const strip = createRoadStrip([route], sampler, null, 4, sampler);
	const vertices = strip.visual.vertices.slice(0, 8);
	const firstTop = vertices.slice(2, 4);
	const secondTop = vertices.slice(6, 8);
	const bottoms = [vertices[0], vertices[1], vertices[4], vertices[5]];
	assert.ok(firstTop.every(vertex => Math.abs(vertex[1] - 5.12) < 0.000001));
	assert.ok(secondTop.every(vertex => Math.abs(vertex[1] - 5.22) < 0.000001));
	assert.ok(bottoms.every(vertex => Math.abs(vertex[1] - 0.02) < 0.000001));
	assert.equal(strip.visual.walkable, true);
	assert.equal(strip.visual.userData.AwtsmoosRoadSurface.retainingSides, true);
	assert.equal(strip.stats.retainingSides, true);
	assert.equal(strip.stats.visibleEqualsCollision, true);
});

test('legacy routes without solved heights still follow the supplied sampler', () => {
	const elevatedSampler = {
		heightAt(x, z) {
			return { x, y: x + z + 2, z };
		}
	};
	const legacy = {
		id: 'legacy-road',
		pathfinding: { maximumSampleGap: 1 },
		points: [{ x: 0, z: 0 }, { x: 0, z: 1 }],
		terminalDistances: { from: 0, to: 0 }
	};
	const strip = createRoadStrip([legacy], elevatedSampler, null, 2);
	assert.ok(Math.abs(strip.visual.vertices[2][1] - 2.12) < 0.000001);
	assert.ok(Math.abs(strip.visual.vertices[6][1] - 3.12) < 0.000001);
});
