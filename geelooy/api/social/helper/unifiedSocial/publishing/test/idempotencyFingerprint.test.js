//B"H
//Boruch Hashem
//Blessed be He

/**
 * Idempotency fingerprint proof for the social-acceptance pack.
 *
 * Run from the repository root:
 *   node --test geelooy/api/social/helper/unifiedSocial/publishing/test/
 *
 * The live defect this pins: the hub composer's draft kept one idempotency
 * key across publications, and the executor replayed the FIRST publication's
 * recorded success for a SECOND, different post — 200 OK, nothing created.
 * A key may now only answer for the exact payload it first executed:
 * identical deeds replay, different deeds conflict honestly, and records
 * written before fingerprints existed (whose deed cannot be verified)
 * conflict rather than swallow a new publication.
 */
const assert = require('node:assert/strict');
const test = require('node:test');

const {
	payloadFingerprint,
	replayDecision,
	stableStringify
} = require('../IdempotencyLedger.js');

const plan = {
	aliasId: 'tedt',
	contentKind: 'post',
	primary: { heichelId: 'h1', seriesId: 'root', kind: 'canonical' },
	source: {},
	parentQuestionId: ''
};
const payloadA = { title: 'First post', content: 'alpha' };
const payloadB = { title: 'Second post', content: 'beta' };

test('fingerprint is deterministic regardless of key order', () => {
	const a = payloadFingerprint({ plan, payload: { x: 1, y: { p: 2, q: 3 } } });
	const b = payloadFingerprint({ plan, payload: { y: { q: 3, p: 2 }, x: 1 } });
	assert.equal(a, b);
	assert.equal(stableStringify({ b: 1, a: [3, { d: 4, c: 5 }] }), '{"a":[3,{"c":5,"d":4}],"b":1}');
});

test('different content under one plan yields different fingerprints', () => {
	assert.notEqual(
		payloadFingerprint({ plan, payload: payloadA }),
		payloadFingerprint({ plan, payload: payloadB })
	);
});

test('identical deed replays', () => {
	const fingerprint = payloadFingerprint({ plan, payload: payloadA });
	const record = { status: 'completed', fingerprint, id: 'led1', result: { success: { status: 'published' } } };
	const decision = replayDecision(record, fingerprint);
	assert.equal(decision.action, 'replay');
	assert.equal(decision.result.idempotentReplay, true);
});

test('same key with different content conflicts and publishes nothing', () => {
	const record = {
		status: 'completed',
		fingerprint: payloadFingerprint({ plan, payload: payloadA }),
		id: 'led1',
		result: { success: { status: 'published' } }
	};
	const decision = replayDecision(record, payloadFingerprint({ plan, payload: payloadB }));
	assert.equal(decision.action, 'conflict');
	assert.equal(decision.result.error.code, 'PUBLICATION_KEY_CONFLICT');
});

test('legacy record without a fingerprint conflicts instead of swallowing', () => {
	const record = { status: 'completed', id: 'led0', result: { success: { status: 'published' } } };
	const decision = replayDecision(record, payloadFingerprint({ plan, payload: payloadA }));
	assert.equal(decision.action, 'conflict');
	assert.equal(decision.result.error.code, 'PUBLICATION_KEY_CONFLICT');
});

test('non-terminal or absent records execute', () => {
	assert.equal(replayDecision(null, 'x').action, 'execute');
	assert.equal(replayDecision({ status: 'executing' }, 'x').action, 'execute');
	assert.equal(replayDecision({ status: 'failed' }, 'x').action, 'execute');
});
