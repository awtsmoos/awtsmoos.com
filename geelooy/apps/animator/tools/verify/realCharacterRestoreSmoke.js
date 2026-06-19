// B"H
import assert from 'node:assert/strict';
import { HEALTHY_LUNCH_SCENE } from '../../src/data/scenes/healthyLunch/index.js';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';
import { DefaultSceneInstaller } from '../../src/core/app/DefaultSceneInstaller.js';
const characters = HEALTHY_LUNCH_SCENE.initialCharacters;
const events = HEALTHY_LUNCH_SCENE.events;
const graph = SceneComposer.build({ sceneData: { style: 'authored_world_2d' }, ctx: { width: 720, height: 1080 } });
const json = JSON.stringify(graph);
assert.deepEqual(Object.keys(characters).sort(), ['guide', 'kid']);
assert.ok(characters.kid.colors && characters.guide.colors);
assert.ok(events.some(e => e.type === 'speech'));
assert.ok(events.some(e => e.type === 'character'));
assert.equal(DefaultSceneInstaller.sceneVersion, 'camera-bound-kitchen-acting-v2');
assert.equal(graph.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(json.includes('world_kitchen_wall_upper'));
assert.ok(!json.includes('kid_marker'));
console.log('B"H real character camera-bound restore smoke passed');
