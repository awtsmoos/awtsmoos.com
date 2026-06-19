// B"H
import assert from 'node:assert/strict';
import { ShotContinuityPlanner } from '../../src/camera/production/ShotContinuityPlanner.js';
import { CameraWorldSync } from '../../src/camera/production/CameraWorldSync.js';
assert.equal(ShotContinuityPlanner.smooth({ zoom: 0.8 }, { zoom: 9 }).zoom, 1.05);
assert.ok(CameraWorldSync.assertSharedWorld({ id: 'x', children: ['world_scene_layer', 'entity_world'] }));
console.log('B"H camera continuity smoke passed');
