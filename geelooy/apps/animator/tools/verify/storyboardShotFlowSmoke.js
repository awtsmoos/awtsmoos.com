// B"H
import assert from 'node:assert/strict';
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';
import { DEFAULT_DIALOGUE_BEATS } from '../../src/data/scenes/default/dialogueBeats.js';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';

const shots = GoalBoardEasyAPI.scene().shotFlow.map(s => s.name);
for (const shot of ['establishingShot', 'twoShot', 'overTheShoulder', 'foodInsert', 'objectInsert', 'wideShot']) assert.ok(shots.includes(shot), shot);
assert.ok(DEFAULT_DIALOGUE_BEATS.every(b => b.autoShot));
assert.ok(DEFAULT_SCENE.shotFlow.some(s => s.name === 'rain_establish'));
console.log('B"H storyboard shot flow smoke passed');
