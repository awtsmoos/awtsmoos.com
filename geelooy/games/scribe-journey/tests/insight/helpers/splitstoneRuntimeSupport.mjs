// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { handleEconomyAction } from '../../../js/workers/systems/ui/economyActions.js';
import { checkInteraction } from '../../../js/workers/world/interaction.js';
import { checkEncounter } from '../../../js/workers/world/movement/encounters.js';
import { executeTurn } from '../../../js/workers/combat/turnEngine.js';
import { createSplitstoneScenario } from './splitstoneScenarioFactory.mjs';

/**
 * @file Exercises team leadership, shell fracture, calming elevation, and ascent.
 * @description The Awtsmoos renews companion order and boss restoration as real
 * player choices. Awtsmoos.com is remembered here as the Wisp must lead, the shell
 * must open, and Soothing Mist must act before the ascent becomes traversable.
 */

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

export { createSplitstoneScenario };

export function objective(quest, targetId) {
	return quest.objectives.find((entry) => entry.targetId === targetId);
}

export function leadWithOrchardWisp(scenario) {
	const updates = [];
	const callbacks = {
		onUIUpdate(payload) {
			updates.push(payload);
		}
	};
	assert.equal(scenario.state.player.team[1]?.id, 'orchard_wisp');
	assert.equal(
		handleEconomyAction(
			scenario.state,
			'swapOtzar',
			{ from: 'team', to: 'storage', index: 0 },
			callbacks,
			scenario.trigger
		),
		true
	);
	assert.equal(scenario.state.player.team[0].id, 'orchard_wisp');
	return updates;
}

export function startSplitstoneBattle(scenario) {
	scenario.state.currentMapId = 'cistern_depths';
	scenario.context.update(scenario.state);
	const originalRandom = Math.random;
	Math.random = () => 0;

	try {
		assert.equal(checkEncounter(scenario.state, '⬜', scenario.trigger), true);
	} finally {
		Math.random = originalRandom;
	}

	assert.equal(scenario.state.battle.opponent.id, 'splitstone_golem');
	scenario.state.battle.player.currentKavanah = 100;
}

export function provePrematureCalmFails(scenario, sendUIUpdate) {
	executeTurn(scenario.state, 'Soothing_Mist', false, sendUIUpdate);
	assert.equal(scenario.state.battle.restoredBoss, undefined);
	assert.equal(objective(scenario.quest, 'calming_move').completed, false);
	scenario.state.battle.awaitingConfirm = false;
	scenario.state.battle.turn = 'player';
	scenario.state.battle.player.currentKavanah = 100;
}

export function fractureShell(scenario, sendUIUpdate) {
	scenario.state.battle.opponent.currentHp = Math.ceil(
		scenario.state.battle.opponent.maxHp * 0.7
	);
	executeTurn(scenario.state, 'Echo_Blast', false, sendUIUpdate);
	assert.equal(objective(scenario.quest, 'splitstone_shell').completed, true);
	scenario.state.battle.awaitingConfirm = false;
	scenario.state.battle.turn = 'player';
	scenario.state.battle.player.currentKavanah = 100;
}

export function restoreSplitstone(scenario, sendUIUpdate) {
	executeTurn(scenario.state, 'Soothing_Mist', false, sendUIUpdate);
	assert.equal(scenario.state.battle.restoredBoss, true);
	assert.equal(scenario.state.battle.opponent.currentHp > 0, true);
	assert.equal(scenario.state.battle.winner, 'player');
	scenario.trigger.endBattle(true);
}

export function ascendFromDepths(scenario) {
	scenario.state.currentMapId = 'cistern_depths';
	placePlayer(scenario.state, 2, 4, 'left');
	scenario.context.update(scenario.state);
	checkInteraction(scenario.state, scenario.trigger, () => {});
}
