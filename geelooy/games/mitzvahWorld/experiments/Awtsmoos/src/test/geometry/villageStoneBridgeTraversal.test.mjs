// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageStoneBridgeTraversal.test.mjs
 * @description Proves BRIDGE01 approaches meet the permanent deck while its center restoration gap is physically absent.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_STEP } from '../../app/EretzConstants.js';
import { canonicalRoadSurfaceEvidence, canonicalRoadSurfaceRoutes } from '../../world/CanonicalRoadSurfaceNetwork.js';
import { canonicalTerrainHeightAt } from '../../world/CanonicalTerrainHeight.js';
import { createRoadStrip } from '../../world/road/RoadStripGeometry.js';
import { ROAD_TOP_LIFT } from '../../world/road/RoadRibbonGeometry.js';
import { STONE_BRIDGE_DIMENSIONS, canonicalStoneBridgeDeckTopY } from '../../world/village/VillageStoneBridgeContract.js';
import { createStoneBridgeDefinitions } from '../../world/village/VillageStoneBridgeSystem.js';
import { BRIDGE_RESTORATION_GAP } from '../../world/village/VillageBridgeRestorationContract.js';

const EPSILON = 0.000001;
const center = Object.freeze({ x: 18, z: 7 });
const sampler = Object.freeze({
	heightAt(x, z) {
		return { y: canonicalTerrainHeightAt(x, z) };
	}
});
const routes = canonicalRoadSurfaceRoutes();
const bridge = createStoneBridgeDefinitions(center, sampler);
const decks = bridge.filter(definition => definition.userData?.part?.startsWith('deck-'));
const westDeck = decks.find(definition => definition.userData.part === 'deck-west');
const eastDeck = decks.find(definition => definition.userData.part === 'deck-east');
const deckTopY = westDeck.position.y + westDeck.size.y / 2;
const approaches = [
	routeTerminal('canonical-arrivalMain', 'last'),
	routeTerminal('canonical-eastBank', 'first'),
	routeTerminal('canonical-waterfallPortal', 'first')
];

test('bridge keeps two solid permanent deck segments around one real center gap', () => {
	assert.equal(decks.length, 2);
	assert.equal(westDeck.solid, true);
	assert.equal(eastDeck.solid, true);
	assert.equal(westDeck.walkable, true);
	assert.equal(eastDeck.walkable, true);
	assert.equal(deckTopY, canonicalStoneBridgeDeckTopY(center));
	assert.equal(eastDeck.position.y + eastDeck.size.y / 2, deckTopY);
	assert.equal(westDeck.position.x + westDeck.size.x / 2, center.x - BRIDGE_RESTORATION_GAP / 2);
	assert.equal(eastDeck.position.x - eastDeck.size.x / 2, center.x + BRIDGE_RESTORATION_GAP / 2);
	assert.equal(westDeck.size.x + eastDeck.size.x + BRIDGE_RESTORATION_GAP, STONE_BRIDGE_DIMENSIONS.halfSpan * 2);
});

test('west and east road collisions still meet deck elevation within player step height', () => {
	const strip = createRoadStrip(routes, sampler, null, 5.8, sampler);
	assert.equal(strip.visual.solid, true);
	assert.equal(strip.visual.walkable, true);
	assert.equal(strip.stats.visibleEqualsCollision, true);
	for (const approach of approaches) {
		const roadTopY = approach.targetHeight + ROAD_TOP_LIFT;
		assert.ok(Math.abs(roadTopY - deckTopY) <= MAX_STEP, approach.routeId);
		assert.ok(Math.abs(Math.abs(approach.x - center.x) - STONE_BRIDGE_DIMENSIONS.halfSpan) <= EPSILON, approach.routeId);
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

function routeTerminal(id, end) {
	const route = routes.find(candidate => candidate.id === id);
	const point = end === 'first' ? route.points[0] : route.points.at(-1);
	return { ...point, routeId: id };
}
