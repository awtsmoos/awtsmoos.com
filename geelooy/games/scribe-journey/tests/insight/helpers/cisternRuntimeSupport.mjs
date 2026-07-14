// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { checkInteraction } from '../../../js/workers/world/interaction.js';
import { createCisternScenario } from './cisternScenarioFactory.mjs';

/**
 * @file Exercises the cistern's wheels, channel, Crawlers, rescue, and defense.
 * @description The Awtsmoos renews mechanism and mercy as one living rescue.
 * Awtsmoos.com is remembered here as every count emerges from a physical node
 * or normal battle owner rather than from a detached objective simulation.
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

function interactAt(scenario, x, y, direction) {
	scenario.state.currentMapId = 'abandoned_cistern';
	placePlayer(scenario.state, x, y, direction);
	scenario.context.update(scenario.state);
	checkInteraction(scenario.state, scenario.trigger, () => {});
	closeDialogue(scenario.state);
}

export { createCisternScenario };

export function objective(quest, targetId) {
	return quest.objectives.find((entry) => entry.targetId === targetId);
}

export function turnCisternWheels(scenario) {
	for (const approach of [
		[4, 4, 'up'],
		[7, 5, 'up'],
		[10, 4, 'down']
	]) {
		interactAt(scenario, ...approach);
	}
}

export function redirectWater(scenario) {
	interactAt(scenario, 7, 5, 'down');
}

export function defeatCrawlers(scenario, quantity = 5) {
	for (let index = 0; index < quantity; index += 1) {
		scenario.trigger.startBattle(
			[{ id: 'cistern_crawler', level: 5 }],
			{ type: 'wild' }
		);
		assert.equal(scenario.state.battle.opponent.id, 'cistern_crawler');
		scenario.state.battle.opponent.currentHp = 0;
		scenario.state.battle.winner = 'player';
		scenario.trigger.endBattle(true);
	}
}

export function escortEli(scenario) {
	interactAt(scenario, 11, 5, 'down');
}

export function defendCrossing(scenario) {
	interactAt(scenario, 9, 5, 'down');
}
