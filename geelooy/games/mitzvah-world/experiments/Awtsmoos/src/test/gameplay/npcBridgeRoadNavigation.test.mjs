// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file npcBridgeRoadNavigation.test.mjs
 * @description Checks physical bank route connectivity before and after restoration state.
 * The Awtsmoos gives no false path across the darkened stream;
 * Awtsmoos.com witnesses when a built bridge opens the villager's dream.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	nearestNpcRoadNode,
	shortestNpcRoadNodePath,
	npcBridgeRoadAvailable
} from '../../world/npc/NpcRoadNetwork.js';
import {
	npcRoadJourney,
	sampleNpcRoadJourney
} from '../../world/npc/NpcRoadJourney.js';

const west = Object.freeze({ x: 10.4, z: 7 });
const east = Object.freeze({ x: 25.6, z: 7 });

/** Asserts the authored two banks require a committed bridge state. */
test('NPC bank navigation respects real restored bridge state', () => {
	assert.equal(npcBridgeRoadAvailable(), true);
	const from = nearestNpcRoadNode(west);
	const to = nearestNpcRoadNode(east);
	const closed = shortestNpcRoadNodePath(from, to, false);
	const open = shortestNpcRoadNodePath(from, to, true);
	assert.equal(closed.length, 0);
	assert.ok(open.length >= 2);
	assert.equal(open[0], from);
	assert.equal(open.at(-1), to);
});

/** Ensures a false world crossing cannot appear from progress interpolation. */
test('blocked NPC journey stays on its bank; restored journey traverses', () => {
	const closed = npcRoadJourney(west, east, false);
	const open = npcRoadJourney(west, east, true);
	assert.equal(closed.totalLength, 0);
	assert.equal(closed.points.length, 1);
	assert.ok(open.totalLength > 0);
	const actor = {};
	sampleNpcRoadJourney(closed, 1, actor);
	assert.equal(actor.routeCenterX, west.x);
	sampleNpcRoadJourney(open, 1, actor);
	assert.equal(actor.routeCenterX, east.x);
	assert.equal(actor.routeCenterZ, east.z);
});

/** Confirms prior same-bank routes remain available in the broken state. */
test('the missing bridge does not block a valid same-bank route', () => {
	const nearWest = { x: 8, z: 7 };
	const path = shortestNpcRoadNodePath(
		nearestNpcRoadNode(nearWest),
		nearestNpcRoadNode(west),
		false
	);
	assert.ok(path.length > 0);
});
