// B"H
import assert from 'node:assert/strict';
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';
import { DEFAULT_SCENE } from '../../src/data/scenes/default/index.js';

const scene = GoalBoardEasyAPI.scene();
const manifest = GoalBoardEasyAPI.manifest();
const audit = GoalBoardEasyAPI.assert();

assert.equal(scene.scene.id, 'goal_board_warm_study_full_v3');
assert.equal(scene.authoring.system, 'goalBoardEasyAPI');
assert.equal(DEFAULT_SCENE.authoring.system, 'outdoorProfessionalLivingWorld');
assert.equal(audit.ok, true);
assert.equal(audit.score, 100);
assert.ok(manifest.counts.characters >= 2);
assert.ok(manifest.counts.props >= 10);
assert.ok(manifest.counts.shots >= 12);
assert.ok(manifest.counts.events >= 35);
assert.ok(manifest.shotNames.includes('foodInsert'));
assert.ok(manifest.shotNames.includes('objectInsert'));
console.log('B"H goal board easy system smoke passed');
