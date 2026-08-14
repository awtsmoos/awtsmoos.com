// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageTerrainEntry.test.mjs
 * @description Proves sloped cottages gain broad support, adaptive clearance, and terrain-fitted walkable stairs.
 * The Awtsmoos raises the dwelling above the hill yet returns each doorway gently to the ground;
 * Awtsmoos.com measures rotated terrain, retaining apron, and every tread so no buried threshold may be found.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalFoundationSample
} from '../../world/village/CanonicalFoundationSampling.js';
import {
	cottageFoundationFootprint
} from '../../world/village/VillageCottageFoundationEnvelope.js';
import {
	appendCottageTerrainEntry
} from '../../world/village/VillageCottageTerrainEntry.js';
import {
	planVillageCottageTerrainEntry
} from '../../world/village/VillageCottageTerrainEntryPlan.js';

const COTTAGE = Object.freeze({
	base: 6.2,
	depth: 8,
	doorWidth: 1.5,
	id: 'H-SLOPE',
	wallHeight: 6,
	width: 10,
	x: 3,
	yaw: 0.42,
	z: 5
});

const TOLERANCE = 0.000001;

function slopedGround(x, z) {
	return 4.55 + x * 0.025 - z * 0.055;
}

test('foundation footprint includes a broad support apron and slope-aware clearance', () => {
	const footprint = cottageFoundationFootprint(COTTAGE);
	const sample = canonicalFoundationSample(COTTAGE.id, slopedGround, footprint);
	assert.equal(footprint.width, COTTAGE.width + 3.2);
	assert.equal(footprint.depth, COTTAGE.depth + 3.2);
	assert.ok(sample.samples > 0);
	assert.ok(sample.terrainVariance > 0);
	assert.ok(sample.clearance >= 0.28);
	assert.ok(sample.clearance <= 0.75);
	assertClose(sample.top, sample.maximumGround + sample.clearance);
	assert.ok(sample.bottom < sample.minimumGround);
});

test('terrain entry rises gently and every tread clears sampled hillside', () => {
	const plan = planVillageCottageTerrainEntry(COTTAGE, slopedGround);
	assert.ok(plan.steps.length >= 2);
	assert.ok(plan.maximumRise <= 0.2 + TOLERANCE);
	assert.ok(plan.minimumClearance >= 0.08 - TOLERANCE);
	assertClose(plan.steps.at(-1).top, plan.threshold);
	for (const tread of plan.steps) {
		assert.ok(tread.top >= tread.terrainY + 0.08 - TOLERANCE);
		assert.ok(tread.bottom < tread.top);
	}
});

test('terrain entry manifests one solid-capable box record per planned tread', () => {
	const boxes = [];
	const plan = appendCottageTerrainEntry(boxes, COTTAGE, slopedGround);
	assert.equal(boxes.length, plan.steps.length);
	assert.ok(boxes.length > 0);
	for (const box of boxes) {
		assert.ok(box.size.x > 0);
		assert.ok(box.size.y > 0);
		assert.ok(box.size.z > 0);
		assert.ok(Number.isFinite(box.position.y));
	}
});

function assertClose(actual, expected) {
	assert.ok(Math.abs(actual - expected) <= TOLERANCE, `${actual} != ${expected}`);
}
