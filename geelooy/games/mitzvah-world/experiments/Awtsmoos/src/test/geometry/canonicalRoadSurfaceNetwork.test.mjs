// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canonicalRoadSurfaceNetwork.test.mjs
 * @description Proves dense road tops remain supported, shared, deterministic, and safely graded.
 * The Awtsmoos holds every cobble above its terrain vessel; Awtsmoos.com verifies that eleven
 * canonical routes meet through one elevation graph without flattening riverbanks or mountain rock.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalRoadSurfaceEvidence,
	canonicalRoadSurfaceRoutes
} from '../../world/CanonicalRoadSurfaceNetwork.js';

const routes = canonicalRoadSurfaceRoutes();
const evidence = canonicalRoadSurfaceEvidence();

test('dense surface network keeps eleven canonical routes and bounded spacing', () => {
	assert.equal(routes.length, 11);
	assert.equal(evidence.routeCount, 11);
	assert.ok(evidence.nodeCount > 500);
	assert.equal(evidence.maximumGrade, 0.16);
	assert.equal(evidence.sampleSpacing, 1);
	assert.ok(evidence.relaxationPasses > 0);
	for (const route of routes) {
		assert.ok(route.points.length > 2, route.id);
		assert.equal(
			route.pathfinding.gradeAuthority,
			'dense-shared-raised-road-surface'
		);
		assert.equal(route.pathfinding.maximumSampleGap, 1);
	}
});

test('every road sample stays above support terrain and every edge stays safe', () => {
	let maximumGrade = 0;
	let maximumRetainingHeight = 0;
	for (const route of routes) {
		for (const point of route.points) {
			assert.ok(Number.isFinite(point.targetHeight), route.id);
			assert.ok(Number.isFinite(point.terrainHeight), route.id);
			assert.ok(
				point.targetHeight >= point.terrainHeight + evidence.clearance - 0.000001,
				route.id
			);
			maximumRetainingHeight = Math.max(
				maximumRetainingHeight,
				point.targetHeight - point.terrainHeight
			);
		}
		for (let index = 1; index < route.points.length; index += 1) {
			maximumGrade = Math.max(
				maximumGrade,
				edgeGrade(route.points[index - 1], route.points[index])
			);
		}
	}
	assert.ok(maximumGrade <= evidence.maximumGrade + 0.000001);
	assert.ok(maximumRetainingHeight > 1);
	assert.ok(maximumRetainingHeight < 20);
});

test('shared world coordinates resolve to exactly one road elevation', () => {
	const heights = new Map();
	let sharedSamples = 0;
	for (const route of routes) {
		for (const point of route.points) {
			const key = `${point.x.toFixed(5)}:${point.z.toFixed(5)}`;
			if (heights.has(key)) {
				sharedSamples += 1;
				assert.equal(point.targetHeight, heights.get(key), key);
			} else {
				heights.set(key, point.targetHeight);
			}
		}
	}
	assert.ok(sharedSamples >= 9);
});

test('surface routes and evidence are immutable and deterministic', () => {
	assert.equal(canonicalRoadSurfaceRoutes(), routes);
	assert.equal(canonicalRoadSurfaceEvidence(), evidence);
	assert.equal(Object.isFrozen(routes), true);
	assert.ok(routes.every(route => Object.isFrozen(route)));
	assert.ok(routes.every(route => Object.isFrozen(route.points)));
});

function edgeGrade(first, second) {
	const run = Math.hypot(second.x - first.x, second.z - first.z) || 1;
	return Math.abs(second.targetHeight - first.targetHeight) / run;
}
