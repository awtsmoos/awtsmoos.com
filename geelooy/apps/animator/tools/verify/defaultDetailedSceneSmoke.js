// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { GoalBoardEasyAPI, GoalBoardQualityGate } from '../../src/authoring/goalBoard/index.js';
import { ProfessionalQualityGate } from '../../src/data/scenes/default/professional2d/index.js';
import { EmotionLibrary } from '../../src/performance/face/EmotionLibrary.js';

const studyScene = GoalBoardEasyAPI.scene();
const studyAudit = GoalBoardQualityGate.audit(studyScene);
const defaultAudit = ProfessionalQualityGate.audit(DEFAULT_SCENE);

assert.equal(studyScene.scene.id, 'goal_board_warm_study_full_v3');
assert.equal(studyScene.scene.style, 'goal_board_warm_study');
assert.equal(studyScene.authoring.system, 'goalBoardEasyAPI');
assert.ok(studyScene.initialProps.length >= 10);
assert.ok(studyScene.events.length >= 35);
assert.ok(studyAudit.ok);
assert.ok(studyScene.initialCharacters.rabbi_left.beard === true);
assert.ok(studyScene.initialCharacters.rabbi_right.hatType === 'blackHat');
assert.equal(DEFAULT_SCENE.id, 'professional_outdoor_default_2d_storm_lantern_v1');
assert.equal(DEFAULT_SCENE.scene.environment, 'professional_2d_outdoor_plaza');
assert.equal(DEFAULT_SCENE.authoring.system, 'professionalDefault2D');
assert.equal(defaultAudit.ok, true);
assert.equal(defaultAudit.score, 100);
assert.ok(EmotionLibrary.get('delighted').mouth.smile > 0.8);
assert.ok(EmotionLibrary.get('skeptical').brows.squeeze > 0.2);
console.log('B"H detailed default scene smoke passed');
