// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { DEFAULT_DIALOGUE_BEATS } from '../../src/data/scenes/default/dialogueBeats.js';
const shots = DEFAULT_SCENE.shotFlow.map(s => s.name);
for (const shot of ['establishingShot', 'twoShot', 'overTheShoulder', 'foodInsert', 'objectInsert', 'wideShot']) assert.ok(shots.includes(shot), shot);
assert.ok(DEFAULT_DIALOGUE_BEATS.every(b => b.autoShot));
console.log('B"H storyboard shot flow smoke passed');
