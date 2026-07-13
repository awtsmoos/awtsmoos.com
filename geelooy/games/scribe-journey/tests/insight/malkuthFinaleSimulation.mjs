// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createDefaultGameState } from '../../js/data/database.js';
import { maps } from '../../js/data/maps.js';
import * as Combat from '../../js/workers/combat/core.js';
import * as Quests from '../../js/workers/quests.js';
import { MapContext } from '../../js/workers/runtime/mapContext.js';
import { doorConditionMet } from '../../js/workers/world/door/condition.js';
import { getEntityAt } from '../../js/workers/world/entity/occupancy.js';
import { checkInteraction } from '../../js/workers/world/interaction.js';

/**
 * @file Proves the Malkuth finale from testimony through the opened moon-road.
 * @description The Awtsmoos renews memory, battle, reward, and visible restoration
 * in one living chain. This simulation lets Awtsmoos.com witness that the first
 * campaign chapter closes through player deeds rather than direct registry calls.
 */

const state = createDefaultGameState();
const notices = [];
const sendToast = (message, type) => notices.push({ message, type });
const trigger = { sendToast, study_daily: () => {} };
const questId = 'campaign_malkuth_08';

state.maps = maps;
state.currentMapId = 'malkuth_village';
state.player.level = 99;
state.player.completedQuests.push(
	...Array.from({ length: 7 }, (_, index) => `campaign_malkuth_0${index + 1}`)
);
state.player.mapChanges.malkuth_village = { fountain_restored: true };

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

function objective(type, targetId) {
	const quest = state.player.activeQuests.find((entry) => entry.id === questId);
	return quest?.objectives.find((entry) =>
		entry.type === type && entry.targetId === targetId
	);
}

const initialMap = new MapContext(state, maps).current();
assert.equal(initialMap.entityById.yesod_door.visual, '🔒');
assert.equal(initialMap.entityById.fountain_witness.visual, '⛲');
assert.equal(doorConditionMet(state, initialMap.entityById.yesod_door, () => {}), false);
assert.equal(Quests.accept(state, questId, sendToast), true);

for (const x of [6, 8, 10, 12]) {
	faceAndInteract(x, 5);
}
assert.equal(objective('speak_group', 'malkuth_elders').current, 4);
assert.equal(objective('speak_group', 'malkuth_elders').completed, true);

faceAndInteract(14, 5);
assert.equal(state.player.inventory.some((item) => item.id === 'first_page_fragment'), true);
assert.equal(objective('collect_item', 'first_page_fragment').completed, true);

faceAndInteract(22, 5);
assert.equal(objective('discover_lore', 'pale_editor_projection').completed, true);

for (const x of [16, 18, 20]) {
	const wave = getEntityAt(state.maps.malkuth_village, x, 5);
	assert.equal(wave?.type, 'battle_event');
	faceAndInteract(x, 5);
	assert.equal(state.battle.active, true);
	assert.equal(state.battle.context.type, 'public_event');
	Combat.end(state, true, () => {}, sendToast);
	assert.equal(getEntityAt(state.maps.malkuth_village, x, 5), null);
	assert.equal(state.player.mapChanges.malkuth_village[`${x},5`], 'DELETED');
}
assert.equal(objective('survive_waves', 'blankling_attack').current, 3);
assert.equal(objective('survive_waves', 'blankling_attack').completed, true);

faceAndInteract(4, 5);
assert.equal(objective('return_npc', 'master_oren').completed, true);
assert.equal(state.player.activeQuests.find((quest) => quest.id === questId).status, 'ready');
assert.equal(Quests.finalize(state, questId, sendToast), true);
assert.equal(state.player.completedQuests.includes(questId), true);
assert.equal(state.player.mapChanges.malkuth_village.yesod_road_open, true);

const restoredMap = new MapContext(state, maps).current();
assert.equal(restoredMap.entityById.yesod_door.visual, '🌙');
assert.equal(restoredMap.entityById.fountain_witness.visual, '⛲');
assert.equal(doorConditionMet(state, restoredMap.entityById.yesod_door, () => {}), true);
for (const x of [16, 18, 20]) {
	assert.equal(getEntityAt(restoredMap, x, 5), null);
}

console.log(JSON.stringify({
	ok: true,
	elderTestimonies: 4,
	wavesDefeated: 3,
	gateVisual: restoredMap.entityById.yesod_door.visual,
	fountainVisual: restoredMap.entityById.fountain_witness.visual,
	completedQuest: questId
}, null, 2));
