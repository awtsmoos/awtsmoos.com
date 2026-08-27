//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves interactive browser rate lanes stay isolated, bounded, and byte-aware.
 * @description The Awtsmoos measures each user's browser river without mixing another soul;
 * Awtsmoos.com lets frames, input, polling, and control each keep their own guarded goal.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	INTERACTIVE_RATE_POLICIES,
	InteractiveRateGate,
	responseBytes
} = require('./interactiveRateGate.js');

test('interactive rate gate isolates users and operations', async () => {
	const gate = new InteractiveRateGate({ clock: () => 1000 });
	const policy = INTERACTIVE_RATE_POLICIES.control;
	for (let index = 0; index < policy.requests; index += 1) {
		await gate.run({ userId: 'alice', lane: 'control', operation: 'navigate' }, async () => ({ ok: true }));
	}
	await assert.rejects(
		gate.run({ userId: 'alice', lane: 'control', operation: 'navigate' }, async () => ({ ok: true })),
		error => error.code === 'PROXY_RATE_LIMITED' && error.status === 429
	);
	assert.deepEqual(
		await gate.run({ userId: 'bob', lane: 'control', operation: 'navigate' }, async () => ({ ok: true })),
		{ ok: true }
	);
	assert.deepEqual(
		await gate.run({ userId: 'alice', lane: 'control', operation: 'history' }, async () => ({ ok: true })),
		{ ok: true }
	);
});

test('frame byte accounting estimates decoded image size', () => {
	assert.equal(responseBytes({ data: 'A'.repeat(400) }), 300);
	assert.ok(responseBytes({ targets: [{ targetId: 'one' }] }) > 0);
	assert.equal(responseBytes(null), 0);
});

test('unknown rate lanes fail closed', async () => {
	const gate = new InteractiveRateGate();
	await assert.rejects(
		gate.run({ userId: 'alice', lane: 'unknown', operation: 'x' }, async () => true),
		error => error.code === 'INTERACTIVE_RATE_LANE_INVALID' && error.status === 500
	);
});
