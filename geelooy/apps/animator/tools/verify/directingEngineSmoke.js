// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { DirectingEngine } from '../../src/director/intent/index.js';

const plan = DEFAULT_SCENE.directing || DirectingEngine.outdoorStormLantern(DEFAULT_SCENE);
const characterCount = Object.keys(DEFAULT_SCENE.initialCharacters).length;
const keys = ['interaction','environmentalPhysics','liveCamera','facialPerformance','proceduralActing','worldEvents','qa','attention','motivation','microExpressions','secondaryMotion','visualHierarchy','emotionalColorScript','sceneState','directorBrain','dashboard'];
for (const key of keys) assert.ok(plan[key], key);
assert.equal(plan.interaction.length, characterCount);
assert.equal(plan.environmentalPhysics.length, plan.weatherNarrative.length);
assert.equal(plan.liveCamera.length, DEFAULT_SCENE.cameras.length);
assert.equal(Object.keys(plan.facialPerformance).length, characterCount);
assert.equal(Object.keys(plan.proceduralActing).length, characterCount);
assert.equal(plan.worldEvents.length, plan.storyArc.length * 2);
assert.equal(plan.qa.ok, true);
assert.equal(plan.qa.score, 100);
assert.equal(plan.qa.recommendation, 'render_reactive_scene');
assert.equal(plan.directorBrain.ok, true);
assert.equal(plan.dashboard.health, 'directed_scene_ready');
assert.equal(plan.report.warnings.length, 0);
console.log('B"H directing engine smoke passed');
