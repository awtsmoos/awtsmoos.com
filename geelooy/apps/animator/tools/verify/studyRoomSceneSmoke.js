// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
assert.equal(DEFAULT_SCENE.scene.id, 'goal_board_warm_study_full_v3');
assert.equal(DEFAULT_SCENE.scene.style, 'goal_board_warm_study');
assert.equal(DEFAULT_SCENE.authoring.system, 'goalBoardEasyAPI');
assert.ok(DEFAULT_SCENE.initialCharacters.rabbi_left.beard);
assert.ok(DEFAULT_SCENE.initialCharacters.rabbi_right.hatType === 'blackHat');
assert.ok(DEFAULT_SCENE.initialProps.length >= 10);
console.log('B"H study room scene smoke passed');
