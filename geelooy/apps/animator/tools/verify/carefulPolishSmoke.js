// B"H
import assert from 'node:assert/strict';
import { HEALTHY_LUNCH_SCENE } from '../../src/data/scenes/healthyLunch/index.js';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';
import { CinematicCharacterStaging } from '../../src/core/renderer/pipeline/phases/CinematicCharacterStaging.js';
import { PropProcessor } from '../../src/core/app/director/logic/PropProcessor.js';
import { DefaultSceneInstaller } from '../../src/core/app/DefaultSceneInstaller.js';

const characters = HEALTHY_LUNCH_SCENE.initialCharacters;
const props = HEALTHY_LUNCH_SCENE.initialProps;
const cameras = HEALTHY_LUNCH_SCENE.cameras;
const events = HEALTHY_LUNCH_SCENE.events;
const graph = SceneComposer.build({ sceneData: { style: 'authored_world_2d' }, ctx: { width: 720, height: 1080 } });
const staged = CinematicCharacterStaging.apply(characters.kid, { camera: cameras.find(c => c.id === 'hl_table'), activeDialogue: { speakerId: 'kid' } });

assert.deepEqual(Object.keys(characters).sort(), ['guide', 'kid']);
assert.ok(characters.kid.position.scale >= 0.82);
assert.ok(cameras.every(c => c.zoom <= 1.02 && c.zoom >= 0.8));
assert.ok(props.every(p => p.size <= 22));
assert.ok(events.some(e => e.type === 'speech'));
assert.equal(graph.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(JSON.stringify(graph).includes('world_kitchen_wall_upper'));
assert.ok(staged._cinematicFocus);
assert.equal(DefaultSceneInstaller.sceneVersion, 'camera-bound-kitchen-acting-v2');

const state = { value: { props: [{ id: 'apple', type: 'apple', x: 0, y: 0, size: 14 }] }, get(k) { return this.value[k]; }, set(k, v) { this.value[k] = v; } };
PropProcessor.process(state, { id: 'apple', type: 'apple', action: 'hop', from: { x: 0, y: 100 }, to: { x: 10, y: 100 }, height: 200, size: 40 }, 0.5);
assert.ok(state.value.props[0].size <= 24);
assert.ok(state.value.props[0].y >= 82);
console.log('B"H careful camera-bound polish smoke passed');
