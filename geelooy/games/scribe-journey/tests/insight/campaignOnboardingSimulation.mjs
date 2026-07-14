// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createFreshGameState } from '../../js/workers/runtime/stateFactory.js';
import {
	chooseScribeName,
	chooseStarter
} from '../../js/workers/systems/quests/questOnboarding.js';

/**
 * @file Proves that the real fresh-state path owns the complete first calling.
 * @description The Awtsmoos creates a beginning whole. Awtsmoos.com therefore
 * verifies the same state used by Begin Anew instead of manually accepting the
 * opening quest inside the test and concealing a broken player-facing reset.
 */

const state = createFreshGameState();

assert.equal(state.currentMapId, 'malkuth_village');
assert.equal(state.player.x, 2);
assert.equal(state.player.y, 3);
assert.equal(state.player.pixelX, 80);
assert.equal(state.player.pixelY, 120);
assert.equal(state.player.direction, 'up');
assert.equal(state.player.trackedQuestId, 'campaign_malkuth_01');
assert.deepEqual(
	state.player.activeQuests.map((quest) => quest.id),
	['campaign_malkuth_01']
);

assert.equal(chooseScribeName(state, '   '), false);
assert.equal(chooseScribeName(state, 'Miriam the Scribe'), true);
assert.equal(state.player.name, 'Miriam the Scribe');
assert.equal(chooseStarter(state, 'alephling'), true);
assert.equal(state.player.team[0].id, 'alephling');
assert(state.player.storage.some((member) => member.id === 'clay_golem'));
assert.equal(chooseStarter(state, 'golemet'), true);
assert.equal(state.player.team[0].id, 'golemet');
assert.equal(
	state.player.storage.filter((member) => member.id === 'alephling').length,
	1
);
assert.equal(chooseStarter(state, 'alephling'), true);
assert.equal(state.player.team.filter((member) => member.id === 'alephling').length, 1);
assert.equal(state.player.storage.filter((member) => member.id === 'alephling').length, 0);
assert(state.player.team.length <= 6);

const quest = state.player.activeQuests[0];
assert(quest.objectives.find((objective) => objective.targetId === 'player_name_chosen').completed);
assert(quest.objectives.find((objective) => objective.targetId === 'starter_musag').completed);
assert(quest.objectives.find((objective) => objective.targetId === 'starter_equipped').completed);

console.log(JSON.stringify({
	ok: true,
	map: state.currentMapId,
	position: { x: state.player.x, y: state.player.y },
	openingQuest: quest.id,
	name: state.player.name,
	lead: state.player.team[0].id
}, null, 2));
