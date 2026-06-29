// B"H
import assert from 'node:assert/strict';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
<<<<<<< HEAD

const scene = DEFAULT_SCENE;
const json = JSON.stringify(scene);

assert.equal(scene.id, 'outdoor_professional_default_scene_v1');
assert.equal(scene.scene.style, 'outdoor_professional_cinematic');
assert.equal(scene.authoring.system, 'outdoorProfessionalLivingWorld');
assert.ok(Object.keys(scene.initialCharacters).length >= 7);
assert.ok(scene.initialProps.length >= 10);
assert.ok(scene.events.length >= 40);
assert.ok(scene.scene.visualPromise.includes('off_camera'));
assert.ok(json.includes('blinkTiming') && json.includes('eyeSaccades'));
assert.ok(json.includes('puddle_accumulation') && json.includes('footprints'));
assert.ok(json.includes('automaticReframing') && json.includes('occlusionAvoidance'));
assert.equal(scene.directorBrain.score(scene), 100);
console.log('B"H outdoor detailed default scene smoke passed');
=======
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
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
