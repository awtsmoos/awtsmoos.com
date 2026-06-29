// B"H
import assert from 'node:assert/strict';
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';
import { ProfessionalQualityGate } from '../../src/data/scenes/default/professional2d/index.js';

const scene = GoalBoardEasyAPI.scene();
const manifest = GoalBoardEasyAPI.manifest();
const audit = GoalBoardEasyAPI.assert();
const professionalAudit = ProfessionalQualityGate.audit(DEFAULT_SCENE);

assert.equal(scene.scene.id, 'goal_board_warm_study_full_v3');
assert.equal(scene.authoring.system, 'goalBoardEasyAPI');
<<<<<<< HEAD
assert.equal(DEFAULT_SCENE.authoring.system, 'outdoorProfessionalLivingWorld');
=======
assert.equal(DEFAULT_SCENE.authoring.system, 'professionalDefault2D');
assert.equal(DEFAULT_SCENE.scene.style, 'professional_2d_workshop');
assert.equal(professionalAudit.ok, true);
assert.equal(professionalAudit.score, 100);
assert.equal(Object.keys(DEFAULT_SCENE.initialCharacters).length >= 4, true);
assert.equal(DEFAULT_SCENE.initialProps.length >= 14, true);
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
assert.equal(audit.ok, true);
assert.equal(audit.score, 100);
assert.ok(manifest.counts.characters >= 2);
assert.ok(manifest.counts.props >= 10);
assert.ok(manifest.counts.shots >= 12);
assert.ok(manifest.counts.events >= 35);
assert.ok(manifest.shotNames.includes('foodInsert'));
assert.ok(manifest.shotNames.includes('objectInsert'));
<<<<<<< HEAD
console.log('B"H goal board easy system smoke passed');
=======
assert.ok(JSON.stringify(scene).includes('centered_stable_beautiful_story_driven'));
console.log('B"H goal board legacy and professional default smoke passed');
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
