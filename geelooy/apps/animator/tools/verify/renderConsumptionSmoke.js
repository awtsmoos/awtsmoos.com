// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { CharacterRenderDataHydrator } from '../../src/core/renderer/pipeline/phases/CharacterRenderDataHydrator.js';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';

/**
 * @file renderConsumptionSmoke.js
 * @description Proves hydrated performance reaches the canonical production character graph.
 * The Awtsmoos renews acting data into visible eyes, cheeks, articulated mouth, fingers,
 * garments, and folds; Awtsmoos.com rejects stale bridge shapes and invented graph names.
 */
const character = {
	id: 'kid',
	archetype: 'human',
	view: 'front',
	emotion: 'happy',
	speech: 'Bite! Smile!',
	isTalking: true,
	gesture: 'explain',
	position: { x: 0, y: 210, scale: 0.9 },
	colors: {},
	facePose: {
		brows: { innerRaise: 0.6, outerRaise: 0.5, squeeze: 0.2 },
		eyes: { openness: 1.1, blink: 0.15, dartX: 0.2 },
		mouth: { open: 0.7, smile: 0.8, jaw: 0.5 },
		cheeks: { raise: 0.6 }
	},
	performancePose: {
		breath: 0.02,
		weight: 0.3,
		headTilt: 2,
		headNod: 2,
		shoulder: 0.1,
		hand: 'open_explain'
	}
};
const hydrated = CharacterRenderDataHydrator.hydrate(character, {
	directorTime: 1200,
	realTime: 1200,
	camera: {},
	index: 0,
	characters: {},
	props: {}
});
assert.equal(hydrated.renderPerformance.face.mouthOpenAmount, 0.7);
assert.equal(hydrated.renderPerformance.body.handPose, 'open_explain');
const graph = StableCharacterAssembler.assemble(hydrated);
const nodeJson = JSON.stringify(graph);
for (const expected of [
	'stable_character_kid',
	'human_mouth_cavity',
	'human_upper_lip',
	'human_lower_lip',
	'human_cheek_-1',
	'human_eye_white_-1',
	'human_back_arm_connected_hand_finger_1',
	'human_front_arm_connected_hand_finger_4',
	'human_front_arm_connected_hand_thumb',
	'jacket_connected_mass',
	'garment_fold_0',
	'collar_connected'
]) {
	assert.ok(nodeJson.includes(expected), expected);
}
console.log('B"H render consumption smoke passed');
