// B"H
import assert from 'node:assert/strict';
import { AutomaticShotDirector } from '../../src/director/camera/AutomaticShotDirector.js';
import { CinematicMobileShotDirector } from '../../src/director/camera/CinematicMobileShotDirector.js';
import { FrameQualityOracle } from '../../src/director/quality/FrameQualityOracle.js';
import { CinematicStagingDirector } from '../../src/director/staging/CinematicStagingDirector.js';
import { StageLayerComposer } from '../../src/core/renderer/pipeline/layers/StageLayerComposer.js';

globalThis.window = { innerWidth: 360, innerHeight: 640, devicePixelRatio: 1 };
globalThis.innerWidth = 360;
globalThis.innerHeight = 640;
globalThis.devicePixelRatio = 1;

const ctx = { canvas: { width: 720, height: 1280, getBoundingClientRect() { return { width: 360, height: 640, left: 0, top: 0 }; } } };
const state = { get(key) { if (key === 'scene') return { style: 'goal_board warm_study' }; if (key === 'characters') return { a: {}, b: {} }; return null; } };
const plan = AutomaticShotDirector.plan({ ctx, state, time: 7, camera: { zoom: 1 } });
assert.equal(plan.enabled, true);
assert.equal(plan.beat, 'speakerClose');
const cam = CinematicMobileShotDirector.resolve(ctx, state, {}, plan);
assert.ok(cam.zoom >= 1.9);
assert.equal(cam.cinematicDirector, true);
const score = FrameQualityOracle.score(plan, cam);
assert.ok(score.score >= 80);
const staging = CinematicStagingDirector.resolve(plan);
assert.equal(staging.tableAnchor, true);
const root = StageLayerComposer.compose({ ctx, cinematicPlan: plan, cameraTransform: {}, sceneNode: null, entityNodes: [] });
assert.equal(root.type, 'group');
assert.ok(root.children.length >= 3);
console.log('B"H - massive cinematic upgrade smoke passed');
