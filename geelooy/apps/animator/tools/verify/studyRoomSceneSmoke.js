// B"H
import assert from 'node:assert/strict';
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';

const scene = GoalBoardEasyAPI.scene();
assert.equal(scene.scene.id, 'goal_board_warm_study_full_v3');
assert.equal(scene.scene.style, 'goal_board_warm_study');
assert.equal(scene.authoring.system, 'goalBoardEasyAPI');
assert.ok(scene.initialCharacters.rabbi_left.beard);
assert.ok(scene.initialCharacters.rabbi_right.hatType === 'blackHat');
assert.ok(scene.initialProps.length >= 10);
console.log('B"H study room scene smoke passed');
