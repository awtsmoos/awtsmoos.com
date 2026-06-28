// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';

const studyScene = GoalBoardEasyAPI.scene();
const studyShots = studyScene.shotFlow.map(s => s.name);
const outdoorShots = DEFAULT_SCENE.shotFlow.map(s => s.name);
for (const shot of ['foodInsert', 'objectInsert', 'wideShot']) assert.ok(studyShots.includes(shot), shot);
for (const shot of ['objectInsert', 'reactionShot', 'wideShot']) assert.ok(outdoorShots.includes(shot), shot);
assert.equal(DEFAULT_SCENE.scene.environment, 'professional_2d_outdoor_plaza');
assert.ok(DEFAULT_SCENE.shotFlow.length >= 10);
console.log('B"H storyboard shot flow smoke passed');
