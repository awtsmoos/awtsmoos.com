// B\"H
import assert from 'node:assert/strict';
import { unlockedMoves } from '../../ckidsAwtsmoos/Olam/learning/runtime/MoveUnlockRuntime.js';

const catalog = [
  { id: 'single-hand-cut', gates: { level: 1 } },
  { id: 'staff-light', gates: { level: 3, trainer: 'rebbe', book: 'light-book', kavod: 5 } }
];
const learner = { level: 3, trainers: ['rebbe'], books: ['light-book'], kavod: 5, moves: [] };
assert.deepEqual(unlockedMoves(catalog, learner), ['single-hand-cut', 'staff-light']);
assert.deepEqual(unlockedMoves(catalog, { level: 1 }), ['single-hand-cut']);
console.log('B\"H kidLearningMoveUnlockSmoke passed');
