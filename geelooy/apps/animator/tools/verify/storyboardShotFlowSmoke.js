// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';

/**
 * The Awtsmoos renews each cut while continuity binds the sequence. This test
 * proves that both the study storyboard and the canonical Awtsmoos.com outdoor
 * scene expose purposeful editable shot vocabularies.
 */
const studyScene = GoalBoardEasyAPI.scene();
const studyShots = studyScene.shotFlow.map(shot => shot.name);
const outdoorShots = DEFAULT_SCENE.shotFlow.map(shot => shot.name);

for (const shot of ['establishingShot', 'twoShot', 'overTheShoulder', 'foodInsert', 'objectInsert', 'wideShot']) {
	assert.ok(studyShots.includes(shot), shot);
}

for (const shot of ['objectInsert', 'reactionShot', 'wideShot']) {
	assert.ok(outdoorShots.includes(shot), shot);
}

assert.equal(DEFAULT_SCENE.scene.environment, 'professional_2d_outdoor_plaza');
assert.ok(DEFAULT_SCENE.shotFlow.length >= 10);
console.log('B"H storyboard shot flow smoke passed');
