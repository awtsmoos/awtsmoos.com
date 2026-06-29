// B"H
import assert from 'node:assert/strict';
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';

const study = GoalBoardEasyAPI.scene();
assert.equal(study.scene.id, 'goal_board_warm_study_full_v3');
assert.equal(study.scene.style, 'goal_board_warm_study');
assert.equal(study.authoring.system, 'goalBoardEasyAPI');
assert.ok(study.initialCharacters.rabbi_left.beard);
assert.ok(study.initialCharacters.rabbi_right.hatType === 'blackHat');
assert.ok(study.initialProps.length >= 10);
assert.equal(DEFAULT_SCENE.authoring.system, 'outdoorProfessionalLivingWorld');
console.log('B"H study room scene smoke passed');
