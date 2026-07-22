// B"H
// Boruch Hashem
// Blessed is He

/** @file friendlyNpcInteraction.test.mjs @description Proves every friendly conversation respects proximity. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { NpcChossid } from '../../world/NpcChossid.js';
import { friendlyNpcInteractionDecision } from '../../world/npc/FriendlyNpcInteractionRules.js';

test('interaction decision uses the profile radius and planar player distance', () => {
	assert.equal(friendlyNpcInteractionDecision({ interactionRadius: 4.5 }, { x: 0, z: 0 }, { x: 3, z: 0 }).ok, true);
	const far = friendlyNpcInteractionDecision({ interactionRadius: 4.5 }, { x: 0, z: 0 }, { x: 8, z: 0 });
	assert.equal(far.ok, false);
	assert.equal(far.reason, 'approach-required');
});

test('far dialogue emits a prompt but no talk or quest progress', () => {
	const events = [];
	const actor = actorFixture(events, { x: 10, z: 0 });
	assert.equal(actor.dialogue(), false);
	assert.deepEqual(events.map(event => event.type), ['npc:prompt']);
	assert.equal(events[0].detail.reason, 'approach-required');
});

test('near dialogue emits talk, quest progress, and the canonical offer', () => {
	const events = [];
	const actor = actorFixture(events, { x: 2, z: 0 });
	assert.equal(actor.dialogue(), true);
	assert.deepEqual(events.map(event => event.type), [
		'npc:prompt',
		'npc:dialogue',
		'npc:talk',
		'quest:event',
		'quest:offer'
	]);
});

function actorFixture(events, playerPosition) {
	const actor = Object.create(NpcChossid.prototype);
	Object.assign(actor, {
		bus: { emit(type, detail) { events.push({ detail, type }); } },
		currentAction: 'working',
		dailyPeriod: 'day',
		dialogueOpen: false,
		health: 100,
		lastPlayerPosition: playerPosition,
		navigationTarget: null,
		profile: {
			dialogue: { greeting: 'Shalom.' },
			dialogueModes: ['greeting'],
			id: 'rebbe-mendel',
			interactionRadius: 4.5,
			name: 'Reb Mendel',
			questId: 'village-light',
			relationship: { initial: 'neighbor' },
			role: 'Teacher'
		},
		relationshipState: 'neighbor',
		selected: true,
		worldX: 0,
		worldY: 0,
		worldZ: 0
	});
	return actor;
}
