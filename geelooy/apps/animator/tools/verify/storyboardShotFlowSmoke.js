// B"H
import assert from 'node:assert/strict';
<<<<<<< HEAD
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';
import { DEFAULT_DIALOGUE_BEATS } from '../../src/data/scenes/default/dialogueBeats.js';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';

const shots = GoalBoardEasyAPI.scene().shotFlow.map(s => s.name);
for (const shot of ['establishingShot', 'twoShot', 'overTheShoulder', 'foodInsert', 'objectInsert', 'wideShot']) assert.ok(shots.includes(shot), shot);
assert.ok(DEFAULT_DIALOGUE_BEATS.every(b => b.autoShot));
assert.ok(DEFAULT_SCENE.shotFlow.some(s => s.name === 'rain_establish'));
=======
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';

const studyScene = GoalBoardEasyAPI.scene();
const studyShots = studyScene.shotFlow.map(s => s.name);
const outdoorShots = DEFAULT_SCENE.shotFlow.map(s => s.name);
for (const shot of ['foodInsert', 'objectInsert', 'wideShot']) assert.ok(studyShots.includes(shot), shot);
for (const shot of ['objectInsert', 'reactionShot', 'wideShot']) assert.ok(outdoorShots.includes(shot), shot);
assert.equal(DEFAULT_SCENE.scene.environment, 'professional_2d_outdoor_plaza');
assert.ok(DEFAULT_SCENE.shotFlow.length >= 10);
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
console.log('B"H storyboard shot flow smoke passed');
