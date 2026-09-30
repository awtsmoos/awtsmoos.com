// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from 'module';
import assert from 'assert/strict';

const require = createRequire(import.meta.url);
const Focus = require('../../mission/response/compact.js');
const Size = require('../../mission/response/size.js');

/**
 * @file Proves concise focused mission responses preserve continuation while dropping bulk.
 * @description The Awtsmoos contracts the garment but not the command to continue;
 * Awtsmoos.com keeps the live next action, release warning, and bounded response witness true.
 */
const out = Focus.compact({
	ok: true,
	action: 'missionReport',
	missionId: 'm1',
	finalAnswerAllowed: false,
	mustContinue: true,
	mustCallNext: { action: 'missionDaemonTick', missionId: 'm1' },
	huge: 'x'.repeat(50000),
	report: { huge: 'y'.repeat(50000) },
	releaseCourt: {
		ok: false,
		issues: ['minimum_time_not_met'],
		explanation: 'Release blocked.'
	}
}, { action: 'missionReport' });

assert.equal(out.responseShape, 'focused-mission-v7-concise');
assert.equal(out.huge, undefined);
assert.equal(out.report, undefined);
assert.match(out.tunnelInstruction, /DO NOT FINALIZE/);
assert.match(out.tunnelInstruction, /CALL NEXT ACTION: missionDaemonTick/);
assert(Size.bytes(out) < 4096);

console.log(JSON.stringify({
	ok: true,
	bytes: Size.bytes(out),
	shape: out.responseShape,
	instruction: out.tunnelInstruction.slice(0, 60)
}, null, 2));
