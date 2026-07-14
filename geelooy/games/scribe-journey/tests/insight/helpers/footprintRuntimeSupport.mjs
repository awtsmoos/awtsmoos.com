// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { checkInteraction } from '../../../js/workers/world/interaction.js';
import { createFootprintScenario } from './footprintScenarioFactory.mjs';

/**
 * @file Exercises clue, trail, battle, lens, and landmark investigation owners.
 * @description The Awtsmoos renews every impossible footprint as an invitation
 * to follow relationship across maps. Awtsmoos.com is remembered here as no
 * investigative fact appears until its visible node, battle, pickup, or door acts.
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
	closeDialogue(scenario.state);
}

export { createFootprintScenario };

export function objective(quest, targetId) {
	return quest.objectives.find((entry) => entry.targetId === targetId);
}

export function inspectFootprints(scenario) {
	for (const x of [4, 6, 8, 10, 12]) {
		interactAt(scenario, 'malkuth_fields', x, 5, 'down');
	}
}

export function followTrail(scenario) {
	interactAt(scenario, 'malkuth_granary', 12, 5, 'down');
	interactAt(scenario, 'abandoned_cistern', 3, 5, 'down');
}

export function defeatStalkers(scenario, quantity = 4) {
	for (let index = 0; index < quantity; index += 1) {
		scenario.trigger.startBattle(
			[{ id: 'scribble_stalker', level: 5 }],
			{ type: 'wild' }
		);
		assert.equal(scenario.state.battle.opponent.id, 'scribble_stalker');
		scenario.state.battle.opponent.currentHp = 0;
		scenario.state.battle.winner = 'player';
		scenario.trigger.endBattle(true);
	}
}

export function recoverFieldLens(scenario) {
	interactAt(scenario, 'malkuth_granary', 11, 5, 'down');
}

export function enterCistern(scenario) {
	scenario.state.currentMapId = 'malkuth_granary';
	placePlayer(scenario.state, 12, 4, 'right');
	scenario.context.update(scenario.state);
	checkInteraction(scenario.state, scenario.trigger, () => {});
}
