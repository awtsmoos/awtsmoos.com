// B"H
import assert from 'node:assert/strict';
import { StageAnchorResolver } from '../../src/staging/StageAnchorResolver.js';
import { CompositionRules } from '../../src/staging/CompositionRules.js';

assert.equal(StageAnchorResolver.resolve({ anchor: 'plateCenter' }).y, 105);
assert.equal(CompositionRules.clampCamera({ zoom: 9 }).zoom, 1.05);
console.log('B"H staging smoke passed');
