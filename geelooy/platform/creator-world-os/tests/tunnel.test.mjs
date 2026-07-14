// B"H
// Boruch Hashem
// Blessed is He
/** @module TunnelTrainTest @description Verifies chapters fifty-one through fifty-five. */
import assert from 'node:assert/strict';
import {
	createFairnessSummary,
	createJobLineage,
	createQuarantineRecord,
	evaluateReplaySafety,
	traceJobLineage,
	transitionWorker
} from '../tunnel/index.mjs';

const root = createJobLineage({ jobId: 'a', action: 'read', inputHash: '1' });
const retry = createJobLineage({ jobId: 'b', parentJobId: 'a', rootJobId: 'a', reason: 'retry' });
assert.deepEqual(traceJobLineage('b', [retry, root]).map(node => node.jobId), ['a', 'b']);
const active = transitionWorker({ state: 'queued' }, 'active');
assert.equal(transitionWorker(active, 'completed').state, 'completed');
assert.throws(() => transitionWorker({ state: 'queued' }, 'completed'));
const quarantine = createQuarantineRecord({ workerId: 'w1', reason: 'stale', processIdentity: { pid: 1 } });
assert.equal(quarantine.state, 'quarantined');
assert.equal(evaluateReplaySafety({ inputHash: 'a', environmentHash: 'b' }).safe, true);
assert.equal(evaluateReplaySafety({ destructive: true }).safe, false);
const fairness = createFairnessSummary([
	{ requesterId: 'a', lane: 'p1', state: 'queued' },
	{ requesterId: 'a', lane: 'p1', state: 'completed' }
]);
assert.equal(fairness.requesters.a.completed, 1);
console.log('B"H tunnel train passed.');
