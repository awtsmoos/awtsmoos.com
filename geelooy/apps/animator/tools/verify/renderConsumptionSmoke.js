// B"H
import assert from 'node:assert/strict';
import { CharacterRenderDataHydrator } from '../../src/core/renderer/pipeline/phases/CharacterRenderDataHydrator.js';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { PropBuilder } from '../../src/core/renderer/props/PropBuilder.js';

const character = {
  id: 'kid', archetype: 'human', view: 'front', emotion: 'happy', speech: 'Bite! Smile!', isTalking: true,
  gesture: 'explain', position: { x: 0, y: 210, scale: 0.9 }, colors: {},
  facePose: { brows: { innerRaise: 0.6, outerRaise: 0.5, squeeze: 0.2 }, eyes: { openness: 1.1, blink: 0.15, dartX: 0.2 }, mouth: { open: 0.7, smile: 0.8, jaw: 0.5 }, cheeks: { raise: 0.6 } },
  performancePose: { breath: 0.02, weight: 0.3, headTilt: 2, headNod: 2, shoulder: 0.1, hand: 'open_explain' }
};
const hydrated = CharacterRenderDataHydrator.hydrate(character, { directorTime: 1200, realTime: 1200, camera: {}, index: 0, characters: {}, props: {} });
assert.ok(hydrated.renderPerformance.face.mouthOpenAmount >= 0.7);
assert.ok(hydrated.renderPerformance.body.torsoBreathScale > 1);
const node = StableCharacterAssembler.assemble(hydrated);
const nodeJson = JSON.stringify(node);
for (const expected of ['stable_character_kid', 'mouth_open', 'cheek', 'eye_white', 'finger_1', 'finger_4', 'thumb', 'jacket_fold', 'collar_inner_shadow', 'waist_seam']) assert.ok(nodeJson.includes(expected), expected);
const apple = PropBuilder.build({ id: 'apple', type: 'apple', x: 1, y: 2, size: 20, lifecycle: 'consumed', squash: 0.2 });
const appleJson = JSON.stringify(apple);
for (const expected of ['bite_mark', 'shadow', 'highlight']) assert.ok(appleJson.includes(expected), expected);
console.log('B"H render consumption smoke passed');
