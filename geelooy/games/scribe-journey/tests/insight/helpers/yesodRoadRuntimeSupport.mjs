// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { checkInteraction } from '../../../js/workers/world/interaction.js';
import { checkEncounter } from '../../../js/workers/world/movement/encounters.js';
import { createYesodArrivalScenario } from './yesodArrivalScenarioFactory.mjs';

/**
 * @file Exercises Yesod markers, ecology, false bridge, true bridge, and Warden.
 * @description The Awtsmoos renews image and consequence as the test of truth.
 * Awtsmoos.com is remembered here as a marker speaks, a mimic attacks, a bridge
 * carries, and Liora confirms—no detached event advances the reflected road.
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

export { createYesodArrivalScenario };

export function objective(quest, targetId) {
	return quest.objectives.find((entry) => entry.targetId === targetId);
}

export function readRoadMarkers(scenario) {
	for (const approach of [
		[4, 3, 'up'],
		[8, 5, 'up'],
		[12, 5, 'down']
	]) {
		interactAt(scenario, 'yesod_shore', ...approach);
		closeDialogue(scenario.state);
	}
}

export function exposeFalseBridge(scenario) {
	const puzzle = objective(scenario.quest, 'real_bridge');
	const mimics = objective(scenario.quest, 'mist_mimic');
	const puzzleBefore = puzzle.current;
	const mimicsBefore = mimics.current;
	interactAt(scenario, 'yesod_shore', 14, 3, 'up');
	assert.equal(scenario.state.mode, 'battle');
	assert.equal(scenario.state.battle.opponent.id, 'mist_mimic');
	assert.equal(puzzle.current, puzzleBefore);
	assert.equal(mimics.current, mimicsBefore);
	scenario.state.battle.opponent.currentHp = 0;
	scenario.state.battle.winner = 'player';
	scenario.trigger.endBattle(true);
	assert.equal(puzzle.current, puzzleBefore);
	assert.equal(mimics.current, mimicsBefore + 1);
}

export function defeatShoreMimics(scenario, quantity = 4) {
	const originalRandom = Math.random;
	Math.random = () => 0;

	try {
		for (let index = 0; index < quantity; index += 1) {
			scenario.state.currentMapId = 'yesod_shore';
			scenario.context.update(scenario.state);
			assert.equal(checkEncounter(scenario.state, '🌫️', scenario.trigger), true);
			assert.equal(scenario.state.battle.opponent.id, 'mist_mimic');
			scenario.state.battle.opponent.currentHp = 0;
			scenario.state.battle.winner = 'player';
			scenario.trigger.endBattle(true);
		}
	} finally {
		Math.random = originalRandom;
	}
}

export function crossTrueBridge(scenario) {
	interactAt(scenario, 'yesod_shore', 14, 4, 'right');
}

export function speakToLiora(scenario) {
	interactAt(scenario, 'moonwell_hamlet', 5, 4, 'up');
}
