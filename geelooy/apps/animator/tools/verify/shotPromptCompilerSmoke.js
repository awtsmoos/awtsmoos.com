// B"H
import assert from 'node:assert/strict';
import { ShotPromptCompiler } from '../../src/ai/ShotPromptCompiler.js';
assert.equal(ShotPromptCompiler.compile('dramatic push to apple food').movementIntent,'pushIn');
assert.equal(ShotPromptCompiler.compile('show food').shotIntent,'foodAction');
console.log('B"H shot prompt compiler smoke passed');
