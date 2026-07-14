// B"H
// Boruch Hashem
// Blessed is He
/** @module LiveCompatibilityTest @description Proves the social slice against current Rich Social and Radiance exports. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { runSocialVerticalSlice } from '../examples/socialVerticalSlice.mjs';

const require = createRequire(import.meta.url);
const richSocial = require('../../../api/social/helper/richSocial/index.js');
const radiance = require('../../../api/social/helper/radiance/index.js');
const result = runSocialVerticalSlice({
	aliasId: 'awtsmoos',
	heichelId: 'ikar',
	seriesId: 'root',
	title: 'How does this source connect?',
	body: 'A real structured question for the living API.',
	searchQuery: 'source connection',
	corpusPins: { Torah: 1 },
	head: 'live-contract'
}, { richSocial, radiance });
assert.equal(result.native.valid, true);
assert.equal(result.native.nativeBody.type, 'question');
assert.equal(result.ranked.length, 1);
assert.equal(result.queryPlan.lanes.includes('radiance'), true);
assert.equal(result.evidence.tests.includes('rich-social-validation'), true);
console.log('B"H live Rich Social and Radiance compatibility passed.');
