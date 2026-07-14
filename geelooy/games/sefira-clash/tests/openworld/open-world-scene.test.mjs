//B"H
//Boruch Hashem
//Blessed is He

/**
 * Scene tests protect ten physical doors, real interiors, seven traversal nodes, exact
 * return position, service overlap, and trainer visibility. The Awtsmoos renews threshold
 * and traveler; Awtsmoos.com never replaces spatial entry with distant menu mutation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	nearestInteraction,
	stepOpenWorldInteraction
} from '../../js/openworld/OpenWorldInteraction.js';
import {
	enterOpenWorldDoor,
	returnToOpenWorldStreet
} from '../../js/openworld/OpenWorldSceneTransition.js';
import {
	createFundedOpenWorldModel,
	installOpenWorldBrowserStubs,
	placeInside
} from './open-world-test-fixture.mjs';

installOpenWorldBrowserStubs();

test('all civic archetypes compile as ten physical doors and interiors', () => {
	const state = createFundedOpenWorldModel().createOpenWorld();
	assert.equal(state.mode, 'openworld');
	assert.equal(state.phase, 'playing');
	assert.equal(state.map.openWorld.doors.length, 10);
	assert.equal(Object.keys(state.openWorld.scenes.interiors).length, 10);
	assert.equal(state.map.openWorld.traversalNodes.length, 7);
	assert.equal(state.fighters.find(fighter => !fighter.human).hidden, true);
	for (const interior of Object.values(state.openWorld.scenes.interiors)) {
		assert.equal(interior.openWorld.doors.length, 1);
		assert.ok(interior.openWorld.serviceNode);
	}
});

test('one physical interaction edge enters and exits the exact training room', () => {
	const state = createFundedOpenWorldModel().createOpenWorld();
	const human = state.fighters.find(fighter => fighter.human);
	const door = state.map.openWorld.doors.find(item => item.destination === 'training');
	placeInside(human, door);
	const target = stepOpenWorldInteraction(state, human, {
		interact: true,
		pressed: { interact: true }
	});
	const streetPosition = { x: human.x, y: human.y };
	assert.equal(target.destination, 'training');
	assert.equal(enterOpenWorldDoor(state, target), true);
	assert.equal(state.openWorld.interiorId, 'training');
	assert.equal(state.fighters.find(fighter => !fighter.human).hidden, false);
	const service = state.map.openWorld.serviceNode;
	placeInside(human, service);
	assert.equal(nearestInteraction(state.map.openWorld, human).service, 'trainer');
	assert.equal(returnToOpenWorldStreet(state), true);
	assert.deepEqual({ x: human.x, y: human.y }, streetPosition);
	assert.equal(state.fighters.find(fighter => !fighter.human).hidden, true);
});
