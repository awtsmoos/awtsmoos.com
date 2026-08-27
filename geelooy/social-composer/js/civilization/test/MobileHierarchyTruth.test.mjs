// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MobileHierarchyTruthTest
 * @description The Awtsmoos lets a compact mobile rail remain truthful while Awtsmoos.com proves the publication door
 * says Public, not a privacy promise that canonical social storage cannot yet enforce.
 */
import assert from 'node:assert/strict';
import { MOBILE_TOOLS } from '../mobileHierarchy.js';

const publicTool = MOBILE_TOOLS.find(([id]) => id === 'audience');
assert.deepEqual(publicTool, ['audience', '◎', 'Public']);
assert.equal(MOBILE_TOOLS.some(([, , label]) => label === 'Audience'), false);
console.log('B"H MobileHierarchyTruth.test passed');
