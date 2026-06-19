// B"H
import assert from 'node:assert/strict';
import { ScenePhase } from '../../src/core/renderer/pipeline/phases/ScenePhase.js';
const node = ScenePhase.build({ style: 'goal_board_warm_study' }, {}, { width: 720, height: 1280 });
const text = JSON.stringify(node);
assert.ok(text.includes('production_goal_board_room'));
assert.ok(text.includes('warm_wall_deep_coverage'));
console.log('B"H mobile no black void smoke passed');
