// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { maps } from '../../js/data/maps.js';
import * as Quests from '../../js/workers/quests.js';
import { createMapContext } from '../../js/workers/runtime/mapContext.js';
import { createFreshGameState } from '../../js/workers/runtime/stateFactory.js';
import { checkInteraction } from '../../js/workers/world/interaction.js';

/**
 * @file Proves Reedbank resources advance quest, inventory, and persistent world state.
 * @description The Awtsmoos renews reed, ink, hand, and remembered absence in one
 * living deed. Awtsmoos.com must never count gathering without granting matter,
 * nor grant matter while resurrecting the same node after the next map projection.
 */

function objective(quest, targetId) {
	return quest.objectives.find((entry) => entry.targetId === targetId);
}

function placePlayer(state, x, y, direction) {
	state.player.x = x;
	state.player.y = y;
	state.player.pixelX = x * 40;
	state.player.pixelY = y * 40;
	state.player.startX = x;
	state.player.startY = y;
	state.player.targetX = x;
	state.player.targetY = y;
	state.player.direction = direction;
	state.player.isMoving = false;
}

function reproject(context, state) {
	return context.update(state);
}

const state = createFreshGameState();
state.player.activeQuests = [];
state.player.completedQuests = ['campaign_malkuth_01'];
state.player.trackedQuestId = null;
state.player.level = 2;
assert.equal(Quests.accept(state, 'campaign_malkuth_02'), true);

const context = createMapContext(maps);
state.currentMapId = 'malkuth_fields';
context.update(state);
const trigger = { sendToast() {} };
const quest = state.player.activeQuests[0];

placePlayer(state, 4, 3, 'up');
checkInteraction(state, trigger, () => {});
assert.equal(objective(quest, 'scribe_reed').current, 1);
assert.equal(state.player.inventory.filter((item) => item.id === 'scribe_reed').length, 1);
assert.equal(state.player.mapChanges.malkuth_fields['4,2'], 'DELETED');
assert.equal(reproject(context, state).interactables['4,2'], undefined);

placePlayer(state, 5, 3, 'down');
checkInteraction(state, trigger, () => {});
assert.equal(objective(quest, 'river_ink').current, 1);
assert.equal(state.player.inventory.filter((item) => item.id === 'river_ink').length, 1);
assert.equal(state.player.mapChanges.malkuth_fields['5,4'], 'DELETED');
assert.equal(reproject(context, state).interactables['5,4'], undefined);

console.log(JSON.stringify({
	ok: true,
	reeds: objective(quest, 'scribe_reed').current,
	ink: objective(quest, 'river_ink').current,
	persistentRemovals: Object.keys(state.player.mapChanges.malkuth_fields).length
}, null, 2));
