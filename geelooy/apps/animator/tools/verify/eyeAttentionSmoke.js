// B"H
import assert from 'node:assert/strict';
import { AttentionEngine } from '../../src/performance/attention/AttentionEngine.js';
const a = AttentionEngine.compose({ character: { id: 'kid' }, event: { lookAt: 'guide' }, time: 800 });
assert.equal(a.target.id, 'guide');
assert.ok(Number.isFinite(a.dart.x));
console.log('B"H eye attention smoke passed');
