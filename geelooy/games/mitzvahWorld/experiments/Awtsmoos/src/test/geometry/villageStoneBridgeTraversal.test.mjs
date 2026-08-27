// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageStoneBridgeTraversal.test.mjs
 * @description Proves BRIDGE01 and its collision-identical roads meet within player step height.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_STEP } from '../../app/EretzConstants.js';
import {
	canonicalRoadSurfaceEvidence,
	canonicalRoadSurfaceRoutes
} from '../../world/CanonicalRoadSurfaceNetwork.js';
import { canonicalTerrainHeightAt } from '../../world/CanonicalTerrainHeight.js';
import { createRoadStrip } from '../../world/road/RoadStripGeometry.js';
import { ROAD_TOP_LIFT } from '../../world/road/RoadRibbonGeometry.js';
import {
	STONE_BRIDGE_DIMENSIONS,
	canonicalStoneBridgeDeckTopY
} from '../../world/village/VillageStoneBridgeContract.js';
import { createStoneBridgeDefinitions } from '../../world/village/VillageStoneBridgeSystem.js';

const EPSILON = 0.000001;
const center = Object.freeze({ x: 18, z: 7 });
const sampler = Object.freeze({
	heightAt(x, z) {
		return { y: canonicalTerrainHeightAt(x, z) };
	}
});
const routes = canonicalRoadSurfaceRoutes();
const bridge = createStoneBridgeDefinitions(center, sampler);
const deck = bridge.find((definition) => definition.userData?.part === 'deck');
const deckTopY = deck.position.y + deck.size.y / 2;
const approaches = [
	routeTerminal('canonical-arrivalMain', 'last'),
	routeTerminal('canonical-eastBank', 'first'),
	routeTerminal('canonical-waterfallPortal', 'first')
];

test('bridge deck uses the shared canonical walkable elevation', () => {
	assert.ok(deck);
	assert.equal(deck.solid, true);
	assert.equal(deck.size.x, STONE_BRIDGE_DIMENSIONS.halfSpan * 2);
	assert.equal(deckTopY, canonicalStoneBridgeDeckTopY(center));
	assert.equal(deck.userData.traversal.walkableSurfaceY, deckTopY);
});

test('west and east road collisions overlap the deck within player step height', () => {
	const strip = createRoadStrip(routes, sampler, null, 5.8, sampler);
	assert.equal(strip.visual.solid, true);
	assert.equal(strip.visual.walkable, true);
	assert.equal(strip.visual.userData.AwtsmoosRoadSurface.visibleEqualsCollision, true);
	for (const approach of approaches) {
		const roadTopY = approach.targetHeight + ROAD_TOP_LIFT;
		assert.ok(Math.abs(roadTopY - deckTopY) <= MAX_STEP, approach.routeId);
		assert.ok(Math.abs(
			Math.abs(approach.x - center.x) - STONE_BRIDGE_DIMENSIONS.halfSpan
		) <= EPSILON, approach.routeId);
		assert.ok(Math.abs(approach.z - center.z) <= STONE_BRIDGE_DIMENSIONS.width / 2);
	}
});

test('bridge elevation anchors propagate through a safe-grade road approach', () => {
	const maximumGrade = canonicalRoadSurfaceEvidence().maximumGrade;
	for (const route of routes) {
		for (let index = 1; index < route.points.length; index += 1) {
			const first = route.points[index - 1];
			const second = route.points[index];
			const run = Math.hypot(second.x - first.x, second.z - first.z) || 1;
			const rise = Math.abs(second.targetHeight - first.targetHeight);
			assert.ok(rise / run <= maximumGrade + EPSILON, route.id);
			assert.ok(rise <= MAX_STEP, route.id);
		}
	}
});

console.log(JSON.stringify({
	approachStepDeltas: approaches.map((point) => Number(Math.abs(
		point.targetHeight + ROAD_TOP_LIFT - deckTopY
	).toFixed(3))),
	deckTopY: Number(deckTopY.toFixed(3)),
	maximumStep: MAX_STEP,
	ok: true
}, null, 2));

function routeTerminal(id, end) {
	const route = routes.find((candidate) => candidate.id === id);
	const point = end === 'first' ? route.points[0] : route.points.at(-1);
	return { ...point, routeId: id };
}
