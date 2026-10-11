// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorMissionAuthor.test.js
 * @description Proves player-authored missions validate strictly and convert
 * into the exact AdventureCatalog quest shape the adventure store can run.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMissionDraft,
	missionDraftToQuest,
	missionObjectiveTypes
} from './MitzvahWorldCreatorMissionAuthor.js';

function validDraft(overrides = {}) {
	return {
		description: 'Bring the lost scroll home.',
		giverName: 'Rabbi Shlomo',
		objectives: [
			{ type: 'collect', target: 'lost-scroll', count: 1, description: 'Find the lost scroll.', x: 10, z: -20 },
			{ type: 'deliver', target: 'lost-scroll', count: 1, description: 'Deliver it to the beis medrash.', x: 0, z: 0 }
		],
		title: 'The Lost Scroll',
		x: 5,
		z: 5,
		...overrides
	};
}

test('objective types cover the playable verbs', () => {
	const types = missionObjectiveTypes();
	for (const expected of ['defeat', 'collect', 'visit', 'build', 'talk', 'deliver']) {
		assert.ok(types.includes(expected));
	}
});

test('createMissionDraft freezes a valid draft with sane reward defaults', () => {
	const draft = createMissionDraft(validDraft({ xp: 250, mitzvahPoints: 7 }));
	assert.ok(draft.id.startsWith('player-mission-'));
	assert.equal(draft.title, 'The Lost Scroll');
	assert.equal(draft.xp, 250);
	assert.equal(draft.mitzvahPoints, 7);
	assert.equal(draft.objectives.length, 2);
	assert.ok(Object.isFrozen(draft));
	assert.ok(Object.isFrozen(draft.objectives));
});

test('createMissionDraft rejects a missing title, empty objectives, and bad types', () => {
	assert.throws(() => createMissionDraft(validDraft({ title: '  ' })), /MISSION_TITLE_TOO_SHORT/);
	assert.throws(() => createMissionDraft(validDraft({ objectives: [] })), /MISSION_NEEDS_OBJECTIVE/);
	assert.throws(
		() => createMissionDraft(validDraft({ objectives: [{ type: 'fly', target: 'x', description: 'Fly.' }] })),
		/MISSION_OBJECTIVE_TYPE_UNKNOWN:fly/
	);
	assert.throws(
		() => createMissionDraft(validDraft({ objectives: [{ type: 'visit', target: 'x' }] })),
		/MISSION_OBJECTIVE_DESCRIPTION_REQUIRED/
	);
});

test('missionDraftToQuest produces the AdventureCatalog quest shape', () => {
	const quest = missionDraftToQuest(createMissionDraft(validDraft()));
	assert.equal(quest.name, 'The Lost Scroll');
	assert.equal(quest.title, 'The Lost Scroll');
	assert.equal(quest.giver.name, 'Rabbi Shlomo');
	assert.equal(quest.giver.id, 'rabbi-shlomo');
	assert.deepEqual(quest.giver.position, { x: 5, y: 0, z: 5 });
	assert.equal(quest.reward.xp, 100);
	assert.equal(quest.reward.mitzvahPoints, 3);
	assert.equal(quest.multiplayer, false);
	assert.equal(quest.playerAuthored, true);
	assert.equal(quest.objectives[0].eventType, 'collect');
	assert.deepEqual(quest.objectives[0].marker, { x: 10, y: 0, z: -20 });
	assert.ok(Object.isFrozen(quest));
});

test('missionDraftToQuest rejects invalid drafts', () => {
	assert.throws(() => missionDraftToQuest(null), /MISSION_DRAFT_INVALID/);
	assert.throws(() => missionDraftToQuest({}), /MISSION_DRAFT_INVALID/);
});
