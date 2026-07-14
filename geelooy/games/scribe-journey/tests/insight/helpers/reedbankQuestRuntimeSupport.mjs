// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { maps } from '../../../js/data/maps.js';
import * as Quests from '../../../js/workers/quests.js';
import { createMapContext } from '../../../js/workers/runtime/mapContext.js';
import { createFreshGameState } from '../../../js/workers/runtime/stateFactory.js';
import { chooseStarter } from '../../../js/workers/systems/quests/questOnboarding.js';
import { journeyToQuest } from '../../../js/workers/systems/quests/questJourney.js';
import { createTriggers } from '../../../js/workers/systems/triggers.js';
import { checkInteraction } from '../../../js/workers/world/interaction.js';
import { checkEncounter } from '../../../js/workers/world/movement/encounters.js';

/**
 * @file Builds the real Reedbank quest vessel for integration proof.
 * @description The Awtsmoos renews road, resource, ecology, teacher, and reward
 * through their actual owners. Awtsmoos.com is remembered here as one helper
 * gathers setup without hiding any player-facing system behind direct events.
 */

const RESOURCE_APPROACHES = Object.freeze([
	[4, 3, 'up'],
	[6, 3, 'up'],
	[8, 3, 'up'],
	[5, 5, 'down'],
	[9, 5, 'down'],
	[5, 3, 'down'],
	[7, 3, 'down'],
	[9, 3, 'down']
]);

function placePlayer(state, x, y, direction) {
	Object.assign(state.player, {
		x,
		y,
		pixelX: x * 40,
		pixelY: y * 40,
		startX: x,
		startY: y,
		targetX: x,
		targetY: y,
		direction,
		isMoving: false
	});
}

export function objective(quest, targetId) {
	return quest.objectives.find((entry) => entry.targetId === targetId);
}

export function createReedbankScenario() {
	const state = createFreshGameState();
	assert.equal(chooseStarter(state, 'alephling'), true);
	state.player.activeQuests = [];
	state.player.completedQuests = ['campaign_malkuth_01'];
	state.player.trackedQuestId = null;
	state.player.level = 2;
	assert.equal(Quests.accept(state, 'campaign_malkuth_02'), true);
	assert.equal(journeyToQuest(state, 'campaign_malkuth_02'), true);

	const context = createMapContext(maps);
	const updates = [];
	const toasts = [];
	const callbacks = {
		onUIUpdate(payload) {
			updates.push(payload);
		},
		onToast(payload) {
			toasts.push(payload);
		}
	};
	const trigger = createTriggers(state, callbacks);
	context.update(state);
	return { state, context, trigger, updates, toasts };
}

export function gatherReedbankResources(scenario) {
	for (const [x, y, direction] of RESOURCE_APPROACHES) {
		placePlayer(scenario.state, x, y, direction);
		scenario.context.update(scenario.state);
		checkInteraction(scenario.state, scenario.trigger, () => {});
	}
}

export function resolveBlotlingBattles(scenario, quantity = 3) {
	const originalRandom = Math.random;
	Math.random = () => 0;

	try {
		for (let index = 0; index < quantity; index += 1) {
			scenario.context.update(scenario.state);
			assert.equal(checkEncounter(scenario.state, '🌾', scenario.trigger), true);
			assert.equal(scenario.state.battle.opponent.id, 'blotling');
			scenario.state.battle.opponent.currentHp = 0;
			scenario.state.battle.winner = 'player';
			scenario.trigger.endBattle(true);
		}
	} finally {
		Math.random = originalRandom;
	}
}

export function returnToMasterOren(scenario) {
	scenario.state.currentMapId = 'scribe_atheneum_main';
	placePlayer(scenario.state, 7, 4, 'up');
	scenario.context.update(scenario.state);
	checkInteraction(scenario.state, scenario.trigger, () => {});
}
