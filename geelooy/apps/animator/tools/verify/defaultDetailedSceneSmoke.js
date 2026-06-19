// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { GoalBoardQualityGate } from '../../src/authoring/goalBoard/index.js';
import { EmotionLibrary } from '../../src/performance/face/EmotionLibrary.js';

const audit = GoalBoardQualityGate.audit(DEFAULT_SCENE);
assert.equal(DEFAULT_SCENE.scene.id, 'goal_board_warm_study_full_v3');
assert.equal(DEFAULT_SCENE.scene.style, 'goal_board_warm_study');
assert.equal(DEFAULT_SCENE.authoring.system, 'goalBoardEasyAPI');
assert.ok(DEFAULT_SCENE.initialProps.length >= 10);
assert.ok(DEFAULT_SCENE.events.length >= 35);
assert.ok(audit.ok);
assert.ok(DEFAULT_SCENE.initialCharacters.rabbi_left.beard === true);
assert.ok(DEFAULT_SCENE.initialCharacters.rabbi_right.hatType === 'blackHat');
assert.ok(EmotionLibrary.get('delighted').mouth.smile > 0.8);
assert.ok(EmotionLibrary.get('skeptical').brows.squeeze > 0.2);
console.log('B"H detailed default scene smoke passed');
