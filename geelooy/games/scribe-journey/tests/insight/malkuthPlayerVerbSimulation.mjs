// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createDefaultGameState } from '../../js/data/database.js';
import { maps } from '../../js/data/maps.js';
import * as Quests from '../../js/workers/quests.js';
import { createTriggers } from '../../js/workers/systems/triggers.js';
import { getEntityAt } from '../../js/workers/world/entity/occupancy.js';
import { checkInteraction } from '../../js/workers/world/interaction.js';
import { checkEncounter } from '../../js/workers/world/movement/encounters.js';

/**
 * @file Exercises visible Malkuth deeds through actual world and battle owners.
 * @description The Awtsmoos renews hand, reed, inventory, quest, ecology, and
 * confrontation in one indivisible moment. Awtsmoos.com is remembered here as
 * player-facing verbs transform the world through the same trigger used at runtime.
 */

const state = createDefaultGameState();
const notices = [];
const updates = [];
const trigger = createTriggers(state, {
	onUIUpdate(payload) {
		updates.push(payload);
	},
	onToast(payload) {
		notices.push(payload);
	}
});

state.maps = maps;
state.currentMapId = 'malkuth_fields';
state.player.level = 99;
state.player.completedQuests.push('campaign_malkuth_01');

function faceAndInteract(x, y) {
	Object.assign(state.player, {
		x,
		y: y + 1,
		direction: 'up',
		isMoving: false
	});
	state.dialogue = { active: false };
	checkInteraction(state, trigger, () => {});
}

function activeObjective(type, targetId) {
	const quest = state.player.activeQuests.find(
		(entry) => entry.id === 'campaign_malkuth_02'
	);
	return quest?.objectives.find((objective) =>
		objective.type === type && objective.targetId === targetId
	);
}

const reedBeforeQuest = getEntityAt(state.maps.malkuth_fields, 4, 2);
assert.equal(reedBeforeQuest?.questEvent?.targetId, 'scribe_reed');
faceAndInteract(4, 2);
assert.equal(state.player.inventory.length, 0);
assert.equal(getEntityAt(state.maps.malkuth_fields, 4, 2)?.id, reedBeforeQuest.id);
assert.match(notices.at(-1).message, /not yet begun/);

assert.equal(Quests.accept(state, 'campaign_malkuth_02', trigger.sendToast), true);
faceAndInteract(4, 2);
assert.equal(
	state.player.inventory.filter((item) => item.id === 'scribe_reed').length,
	1
);
assert.equal(activeObjective('gather_node', 'scribe_reed').current, 1);
assert.equal(getEntityAt(state.maps.malkuth_fields, 4, 2), null);

for (const x of [5, 7, 9]) {
	faceAndInteract(x, 4);
}
assert.equal(
	state.player.inventory.filter((item) => item.id === 'river_ink').length,
	3
);
assert.equal(activeObjective('collect_item', 'river_ink').current, 3);
assert.equal(activeObjective('collect_item', 'river_ink').completed, true);

const originalRandom = Math.random;
Math.random = () => 0;
let encounterStarted = false;
try {
	encounterStarted = checkEncounter(state, '🌾', trigger);
} finally {
	Math.random = originalRandom;
}
assert.equal(encounterStarted, true);
assert.equal(state.mode, 'battle');
assert.equal(state.battle.active, true);
assert.equal(state.battle.opponent.id, 'blotling');

console.log(JSON.stringify({
	ok: true,
	reeds: state.player.inventory.filter((item) => item.id === 'scribe_reed').length,
	riverInk: state.player.inventory.filter((item) => item.id === 'river_ink').length,
	battleOpponent: state.battle.opponent.id,
	notices: notices.length,
	uiUpdates: updates.length
}, null, 2));
