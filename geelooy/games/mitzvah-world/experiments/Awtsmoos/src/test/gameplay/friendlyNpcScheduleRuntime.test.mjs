// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file friendlyNpcScheduleRuntime.test.mjs
 * @description Proves that canonical village biographies become bounded lived movement.
 * The Awtsmoos carries a neighbor from one appointed place to another without multiplying clocks;
 * Awtsmoos.com verifies that time, purpose, dialogue, and performance remain one covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceFriendlyNpcSchedule } from '../../world/npc/FriendlyNpcScheduleRuntime.js';

test('a schedule transition emits once and advances by bounded walking distance', () => {
	const { actor, events } = createActor();
	assert.equal(advanceFriendlyNpcSchedule(actor, 1, 8), true);
	assert.equal(actor.dailyPeriod, 'morning');
	assert.equal(actor.currentAction, 'walking-to:pray-shacharis');
	assert.equal(actor.routeCenterX, 2);
	assert.equal(actor.scheduleChanges, 1);
	assert.deepEqual(events, [{
		action: 'pray-shacharis',
		id: 'rebbe-test',
		locationId: 'shul-plaza',
		period: 'morning',
		type: 'npc:schedule'
	}]);

	advanceFriendlyNpcSchedule(actor, 1, 8);
	assert.equal(actor.routeCenterX, 4);
	assert.equal(actor.scheduleChanges, 1);
	assert.equal(events.length, 1);
});

test('arrival settles exactly on the anchor and exposes the appointed action', () => {
	const { actor } = createActor();
	actor.routeCenterX = 9;
	assert.equal(advanceFriendlyNpcSchedule(actor, 1, 8), false);
	assert.equal(actor.routeCenterX, 10);
	assert.equal(actor.routeCenterZ, 0);
	assert.equal(actor.isTravelling, false);
	assert.equal(actor.currentAction, 'pray-shacharis');
});

test('targeting and dialogue change schedule identity without moving the actor', () => {
	const { actor, events } = createActor();
	actor.routeCenterX = 10;
	actor.selected = true;
	advanceFriendlyNpcSchedule(actor, 10, 12);
	assert.equal(actor.dailyPeriod, 'day');
	assert.equal(actor.navigationTarget.id, 'workshop');
	assert.equal(actor.routeCenterX, 10);
	assert.equal(actor.currentAction, 'attending-player');

	actor.selected = false;
	actor.dialogueOpen = true;
	advanceFriendlyNpcSchedule(actor, 10, 12);
	assert.equal(actor.routeCenterX, 10);
	assert.equal(actor.currentAction, 'speaking');
	assert.equal(events.length, 1);
});

function createActor() {
	const events = [];
	const actor = {
		activeScheduleAction: 'arriving',
		bus: { emit: (type, payload) => events.push({ ...payload, type }) },
		currentAction: 'arriving',
		dailyPeriod: null,
		dialogueOpen: false,
		isTravelling: false,
		navigationTarget: null,
		profile: {
			dailyAnchors: {
				day: anchor('workshop', 'shape-timber', 20, 0),
				evening: anchor('market-square', 'gather', 5, 5),
				morning: anchor('shul-plaza', 'pray-shacharis', 10, 0),
				night: anchor('H16', 'rest-at-home', 0, 0)
			},
			id: 'rebbe-test',
			walkSpeed: 2
		},
		routeCenterX: 0,
		routeCenterZ: 0,
		scheduleChanges: 0,
		selected: false
	};
	return { actor, events };
}

function anchor(id, action, x, z) {
	return { action, location: { id, x, z } };
}
