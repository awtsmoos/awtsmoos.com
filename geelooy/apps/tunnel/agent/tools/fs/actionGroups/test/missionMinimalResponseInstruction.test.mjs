// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from 'module';
import assert from 'assert/strict';

const require = createRequire(import.meta.url);
const Focus = require('../../mission/response/compact.js');
const Size = require('../../mission/response/size.js');

/**
 * @file Proves concise focused mission responses preserve mandatory continuation while dropping bulk.
 * @description The Awtsmoos contracts the garment but preserves every executable continuation witness;
 * Awtsmoos.com keeps the next action, blocked-final state, guidance, and bounded response covenant true.
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
assert.equal(out.mustContinue, true);
assert.equal(out.finalAnswerAllowed, false);
assert.equal(out.mustCallNext?.action, 'missionDaemonTick');
assert.equal(out.nextRequiredToolCall?.action, 'missionDaemonTick');
assert.equal(out.agentGuidance?.nextAction?.action, 'missionDaemonTick');
assert.equal(out.responseFocus?.continuationRequired, true);
assert.equal(out.responseFocus?.finalAnswerBlocked, true);
assert(Size.bytes(out) < 4096);

console.log(JSON.stringify({
	ok: true,
	bytes: Size.bytes(out),
	shape: out.responseShape,
	nextAction: out.nextRequiredToolCall?.action,
	finalAnswerBlocked: out.responseFocus?.finalAnswerBlocked
}, null, 2));
