// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from 'module';
import assert from 'assert/strict';

const require = createRequire(import.meta.url);
const Focus = require('../../mission/response/compact.js');
const Size = require('../../mission/response/size.js');

/**
 * @file Proves a focused mission-start response stays concise without losing its next-step vessel.
 * @description The Awtsmoos lets a vast report become a small faithful receipt;
 * Awtsmoos.com keeps mission continuity while heavy nested report matter leaves the street.
 */
const out = Focus.compact({
	ok: true,
	action: 'missionStart',
	missionId: 'm1',
	next: {
		report: { huge: 'x'.repeat(20000) },
		keepGoing: true,
		verdict: 'continue',
		messageToAgent: 'keep'
	},
	round: {
		id: 'r1',
		status: 'planned',
		steps: [{ index: 0, title: 'a', status: 'pending', huge: 'x'.repeat(5000) }]
	},
	mustCallNext: { action: 'missionNext', missionId: 'm1' }
}, { action: 'missionStart' });

assert.equal(out.responseShape, 'focused-mission-v7-concise');
assert.equal(out.next.report, undefined);
assert(Size.bytes(out) < 4096);

console.log(JSON.stringify({
	ok: true,
	bytes: Size.bytes(out),
	shape: out.responseShape
}, null, 2));
