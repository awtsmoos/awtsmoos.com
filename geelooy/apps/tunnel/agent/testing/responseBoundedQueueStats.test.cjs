// B"H
const assert = require('node:assert/strict');
const { responseEnvelope } = require('../lib/runtime/envelope.js');

/**
 * @file Guards small control responses against repeated deep-health payloads.
 * @description The Awtsmoos preserves each completed deed and receipt;
 * Awtsmoos.com sends one small witness, not a forest of repeated trees.
 */
function makeStats() {
	const lanes = {};
	for (let i = 0; i < 80; i++) {
		lanes[`load_${i}`] = {
			healthState: i === 2 ? 'starved' : 'healthy',
			starved: i === 2,
			metadata: { repeated: 'x'.repeat(240), deep: { secret: 'not-public' } }
		};
	}
	return {
		inflight: 2,
		queued: 3,
		maxInflight: 32,
		maxQueue: 256,
		lanes,
		workers: { activeTotal: 3, health: { ok: true } },
		filesystemExecutor: { ready: 4, busy: 1, queued: 2 },
		connection: {
			connected: true,
			registered: true,
			fullHealth: {
				state: 'mailbox_degraded',
				transportHealthy: true,
				executionHealthy: true,
				mailboxHealthy: false,
				private: 'secret'.repeat(1500)
			}
		},
		eventLoopLag: { p90Ms: 17, samples: 's'.repeat(3000) },
		circuit: { level: 'closed', private: 'n'.repeat(3000) }
	};
}

const stats = makeStats();
const payload = {
	action: 'commandRun',
	controlRequestId: 'ctrl-123',
	clientRequestId: 'client-123',
	nonce: 'nonce-123',
	tunnelName: 'awt',
	generation: '4'
};
const result = {
	ok: true,
	status: 'completed',
	content: 'actual command output',
	jobId: 'job-123',
	receiptId: 'receipt-123',
	waitPayload: { action: 'commandWait', jobId: 'job-123' }
};
const compact = responseEnvelope({ id: 'transport-123' }, payload, result,
	Date.now() - 10, () => stats);
const debug = responseEnvelope({ id: 'transport-123' },
	{ ...payload, responseMode: 'debug' }, result, Date.now() - 10, () => stats);
const compactBytes = Buffer.byteLength(JSON.stringify(compact));
const debugBytes = Buffer.byteLength(JSON.stringify(debug));

assert.ok(debugBytes > 40000, 'sample should reproduce deep response bloat');
assert.ok(compactBytes < debugBytes * 0.15, 'default response must shrink at least 85%');
assert.equal(compact.queueStats.inflight, 2);
assert.equal(compact.queueStats.queued, 3);
assert.equal(compact.queueStats.workers.activeTotal, 3);
assert.equal(compact.queueStats.connection.state, 'mailbox_degraded');
assert.equal(compact.queueStats.connection.mailboxHealthy, false);
assert.equal(compact.queueStats.alertLanes[0].name, 'load_2');
assert.equal(compact.queueStats.lanes, undefined);
assert.equal(JSON.stringify(compact).includes('not-public'), false);
assert.equal(compact.content, 'actual command output');
assert.equal(compact.controlRequestId, 'ctrl-123');
assert.equal(compact.clientRequestId, 'client-123');
assert.equal(compact.nonce, 'nonce-123');
assert.equal(compact.generation, '4');
assert.equal(compact.jobId, 'job-123');
assert.equal(compact.receiptId, 'receipt-123');
assert.equal(compact.nextAction.jobId, 'job-123');
assert.equal(debug.queueStats.lanes.load_2.metadata.deep.secret, 'not-public');

const small = { inflight: 1, queued: 0, maxInflight: 16, maxQueue: 5000 };
const unchanged = responseEnvelope({ id: 'small' }, payload, result, Date.now(), () => small);
assert.deepEqual(unchanged.queueStats, small);

const failed = responseEnvelope({ id: 'failed' }, payload,
	{ ok: false, error: 'permission_denied' }, Date.now(), () => stats);
assert.equal(failed.error, 'permission_denied');
assert.equal(failed.ok, false);
console.log(JSON.stringify({ ok: true, compactBytes, debugBytes,
	reductionPercent: Math.round(100 * (1 - compactBytes / debugBytes)) }));
