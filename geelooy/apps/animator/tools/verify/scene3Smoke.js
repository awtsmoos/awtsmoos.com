// B"H
import assert from 'node:assert/strict';
import { SCENE_THREE } from '../../src/data/scenes/scene3/SceneThree.js';

assert.equal(SCENE_THREE.duration, 12000);
assert.ok(SCENE_THREE.events.length >= 12);
assert.ok(SCENE_THREE.cameras.every(camera => camera.id.startsWith('s3_')));

for (const character of Object.values(SCENE_THREE.initialCharacters)) {
  assert.ok(character.position.y >= 220, `${character.id} must be grounded`);
  assert.ok(character.position.scale <= 0.75, `${character.id} must not flood frame`);
}

const cameraMax = Math.max(...SCENE_THREE.cameras.map(camera => Number(camera.zoom || 0)));
assert.ok(cameraMax <= 1.15, 'scene three avoids giant closeup floods');
console.log('B"H scene three smoke passed');
