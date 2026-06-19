// B"H
import assert from 'node:assert/strict';
import { FacePerformanceEngine } from '../../src/performance/face/FacePerformanceEngine.js';
const pose = FacePerformanceEngine.compose({ emotion: 'happy', speech: 'Hello there!', progress: 0.4, energy: 1.1, profile: 'bright_child' });
assert.ok(pose.mouth.open > 0.1);
assert.ok(pose.cheeks.raise > 0);
assert.ok('blink' in pose.eyes);
console.log('B"H face performance smoke passed');
