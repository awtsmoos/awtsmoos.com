// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { journeyToQuest } from '../../../js/workers/systems/quests/questJourney.js';
import { checkInteraction } from '../../../js/workers/world/interaction.js';
import { createMalkuthFinaleScenario } from './malkuthFinaleScenarioFactory.mjs';

/**
 * @file Exercises testimony, fragment, public waves, lore, return, and road crossing.
 * @description The Awtsmoos renews every finale witness through its visible owner.
 * Awtsmoos.com is remembered here as battle progress waits for victory, dialogue
 * waits for attention, and the final road waits for the completed first page.
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

function closeDialogue(state) {
	state.dialogue = {
		...state.dialogue,
		active: false,
		entity: null,
		lines: [],
		currentLine: 0
	};
	state.mode = 'game';
}

function interactAt(scenario, mapId, x, y, direction) {
	scenario.state.currentMapId = mapId;
	placePlayer(scenario.state, x, y, direction);
	scenario.context.update(scenario.state);
	checkInteraction(scenario.state, scenario.trigger, () => {});
}

export { createMalkuthFinaleScenario };

export function objective(quest, targetId) {
	return quest.objectives.find((entry) => entry.targetId === targetId);
}

export function hearMalkuthElders(scenario) {
	for (const x of [6, 8, 10, 12]) {
		interactAt(scenario, 'malkuth_village', x, 6, 'up');
		closeDialogue(scenario.state);
	}
}

export function recoverFirstPage(scenario) {
	interactAt(scenario, 'malkuth_village', 14, 6, 'up');
	closeDialogue(scenario.state);
}

export function surviveBlanklingWaves(scenario) {
	const opponents = [
		[16, 'blankling_scout'],
		[18, 'blankling_silencer'],
		[20, 'blankling_guardian']
	];
	const waveObjective = objective(scenario.quest, 'blankling_attack');
	const witnessed = [];

	for (const [x, opponentId] of opponents) {
		const progressBefore = waveObjective.current;
		interactAt(scenario, 'malkuth_village', x, 6, 'up');
		assert.equal(scenario.state.mode, 'battle');
		assert.equal(scenario.state.battle.opponent.id, opponentId);
		assert.equal(waveObjective.current, progressBefore);
		scenario.state.battle.opponent.currentHp = 0;
		scenario.state.battle.winner = 'player';
		scenario.trigger.endBattle(true);
		assert.equal(waveObjective.current, progressBefore + 1);
		witnessed.push(opponentId);
	}

	return witnessed;
}

export function witnessPaleEditor(scenario) {
	interactAt(scenario, 'malkuth_village', 22, 6, 'up');
	closeDialogue(scenario.state);
}

export function returnFirstPageToOren(scenario) {
	assert.equal(
		journeyToQuest(scenario.state, scenario.quest.id, scenario.trigger.sendToast),
		true
	);
	scenario.context.update(scenario.state);
	checkInteraction(scenario.state, scenario.trigger, () => {});
	closeDialogue(scenario.state);
}

export function crossMoonlitRoad(scenario) {
	scenario.state.currentMapId = 'malkuth_village';
	placePlayer(scenario.state, 15, 6, 'right');
	scenario.context.update(scenario.state);
	checkInteraction(scenario.state, scenario.trigger, () => {});
}
