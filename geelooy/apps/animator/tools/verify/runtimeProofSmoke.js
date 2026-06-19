// B"H
import assert from 'node:assert/strict';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';
import { DefaultSceneInstaller } from '../../src/core/app/DefaultSceneInstaller.js';
const graph = SceneComposer.build({ sceneData: {}, ctx: { width: 720, height: 1080, canvas: { width: 720, height: 1080 } } });
const json = JSON.stringify(graph);
assert.equal(graph.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(json.includes('world_kitchen_wall_upper'));
assert.ok(!json.includes('fallback_sky_full'));
assert.equal(DefaultSceneInstaller.sceneVersion, 'camera-bound-kitchen-acting-v2');
console.log('B"H runtime camera-bound kitchen smoke passed');
