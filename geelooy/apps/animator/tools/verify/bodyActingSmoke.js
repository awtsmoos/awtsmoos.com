// B"H
import assert from 'node:assert/strict';
import { BodyPerformanceEngine } from '../../src/performance/body/BodyPerformanceEngine.js';
const p = BodyPerformanceEngine.compose({ time: 1200, progress: 0.5, energy: 1, gesture: 'explain', speech: 'words' });
assert.equal(p.hand, 'open_explain');
assert.ok(Number.isFinite(p.breath));
console.log('B"H body acting smoke passed');
