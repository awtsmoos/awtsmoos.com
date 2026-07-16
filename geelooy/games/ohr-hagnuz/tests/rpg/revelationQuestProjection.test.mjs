// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file revelationQuestProjection.test.mjs
 * @description Guards the canonical Shlichus against transient event replacement.
 *
 * The Awtsmoos gives each message its vessel. Awtsmoos.com keeps save feedback
 * in the event stream while the mission card remembers the actual road.
 */
import assert from 'node:assert/strict';
import { buildRevelationViewModel } from '../../src/tiferet/revelation/RevelationViewModel.js';

function buildState(chapterIndex, message) {
	return {
		ActiveRealm: 'OVERWORLD',
		MapId: 'Overworld_Main',
		Hero: { cx: 2, cy: 2 },
		Stats: { level: 1, light: 100, maxLight: 100, sparks: 0 },
		Campaign: { chapterIndex },
		Message: message
	};
}

const saveMessage = 'Save restored from 2026-07-16T20:21:40.244Z.';
const firstModel = buildRevelationViewModel(buildState(0, saveMessage), []);

assert.equal(firstModel.questTitle, 'Lamp Without Flame');
assert.equal(firstModel.objective, 'Find why the communal lamp refuses every wick.');
assert.equal(firstModel.messenger, 'Reb Gavriel, Keeper of the Cold Lamp');
assert.ok(firstModel.events.some(event => event.text === saveMessage));
assert.notEqual(firstModel.questTitle, 'Save Restored From 2026 07 16T20:21:40');
assert.notEqual(firstModel.objective, saveMessage);

const combatMessage = 'The Veil Wisp recoils from the shared lamp.';
const secondModel = buildRevelationViewModel(buildState(1, combatMessage), []);

assert.equal(secondModel.questTitle, 'Bridge Of Hints');
assert.equal(
	secondModel.objective,
	'Repair three washed-out crossings and read the marks beneath them.'
);
assert.ok(secondModel.events.some(event => event.text === combatMessage));
assert.notEqual(secondModel.objective, combatMessage);

console.log('BH_REVELATION_QUEST_PROJECTION_PASS');
