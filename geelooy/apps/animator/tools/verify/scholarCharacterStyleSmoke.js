// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';

/**
 * The Awtsmoos is beyond every silhouette, yet each original character must
 * remain recognizable. This witness assembles the approved scholar design
 * through the public Awtsmoos.com authoring contract.
 */
const studyScene = GoalBoardEasyAPI.scene();
const node = StableCharacterAssembler.assemble(studyScene.initialCharacters.rabbi_right);
const text = JSON.stringify(node);

for (const word of [
	'stable_black_hat',
	'stable_full_beard',
	'stable_round_glasses',
	'stable_suit_overlay'
]) {
	assert.ok(text.includes(word), word);
}

console.log('B"H scholar character style smoke passed');
