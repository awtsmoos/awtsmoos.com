// B"H
import assert from 'node:assert/strict';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';
const graph = SceneComposer.build({ sceneData: { style: 'authored_world_2d' }, ctx: { width: 720, height: 1080, canvas: { width: 720, height: 1080 } } });
const json = JSON.stringify(graph);
assert.equal(graph.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(json.includes('world_kitchen_wall_upper'));
assert.ok(json.includes('world_counter_top'));
assert.ok(json.includes('world_floor_soft_rug'));
assert.ok(!json.includes('skyline_layer'));
assert.ok(!json.includes('building_'));
assert.ok(!json.includes('kid_marker'));
console.log('B"H production camera-bound kitchen passed');
