// B"H
import assert from 'node:assert/strict';
import { StageLayerComposer } from '../../src/core/renderer/pipeline/layers/StageLayerComposer.js';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';
import { HEALTHY_LUNCH_SCENE } from '../../src/data/scenes/healthyLunch/index.js';
import { SpeechProcessor } from '../../src/core/app/director/logic/SpeechProcessor.js';
import { DefaultSceneInstaller } from '../../src/core/app/DefaultSceneInstaller.js';

const sceneNode = SceneComposer.build({ sceneData: { style: 'authored_world_2d' }, ctx: { width: 720, height: 1080 } });
const root = StageLayerComposer.compose({ sceneNode, entityNodes: [{ id: 'actor_probe', type: 'group', children: [] }], cameraTransform: { x: 1, y: 2, scaleX: 3, scaleY: 3 }, dialogueNode: null, fadeNode: null });
const rootJson = JSON.stringify(root);

assert.equal(sceneNode.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(rootJson.indexOf('world_scene_layer') < rootJson.indexOf('entity_world'));
assert.ok(rootJson.includes('camera_world'));
assert.ok(rootJson.includes('world_kitchen_wall_upper'));
assert.ok(!rootJson.includes('screen_scene_layer'));
assert.ok(HEALTHY_LUNCH_SCENE.cameras.every(c => c.zoom >= 0.8));
assert.ok(HEALTHY_LUNCH_SCENE.initialCharacters.kid.position.scale >= 0.82);
assert.equal(DefaultSceneInstaller.sceneVersion, 'camera-bound-kitchen-acting-v2');

const state = { value: { characters: { kid: { id: 'kid', position: {}, emotion: 'curious' } } }, get(k) { return this.value[k]; }, set(k, v) { this.value[k] = v; } };
SpeechProcessor.process(state, { id: 'kid', speech: 'Testing expressive talking motion.', start: 0, end: 1000, lookAt: 'guide' }, 0.45);
assert.equal(state.value.characters.kid.acting, 'talk');
assert.ok(state.value.characters.kid.mouthOpen > 0.2);
assert.ok(Number.isFinite(state.value.characters.kid.headNod));
console.log('B"H camera background acting smoke passed');
