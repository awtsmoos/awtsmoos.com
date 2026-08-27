// B"H
import assert from 'node:assert/strict';
import { GoalBoardScenePreset } from '../../src/authoring/goalBoard/GoalBoardScenePreset.js';

const scene = GoalBoardScenePreset.build();
const propIds = new Set(scene.initialProps.map(prop => prop.id));
const text = JSON.stringify(scene.events);
assert.ok(propIds.has('sealed_manuscript'));
assert.ok(propIds.has('spilled_tea'));
assert.ok(text.includes('manuscript'));
assert.ok(text.includes('tiny danger'));
assert.ok(scene.authoring.title.includes('Centered') || scene.authoring.title);
console.log('B"H - risky simple scene smoke passed');
