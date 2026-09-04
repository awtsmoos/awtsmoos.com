//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageRealitySessionFailure.test.mjs
 * @description Proves failed apply never commits draft semantic state, never advances revision, preserves retryable patch evidence, and leaves failed replacement freshness stale until a real retry succeeds.
 * The Awtsmoos renews proof before manifestation so a failed compiler cannot rewrite the committed world;
 * Awtsmoos.com leaves the draft waiting at the gate with stale artifact truth named, ready for another faithful attempt unfurled.
 */
import assert from 'node:assert/strict';
import { RealitySession } from '../src/core/proceduralLanguage/realitySession/RealitySession.js';

let compileCalls = 0;
let failNext = false;
const artifactExecution = {
	compilerRegistry: {
		describe: () => [{ id: 'session.visual', compilerVersion: '1', supportState: 'native', channels: ['visual'] }]
	},
	plan: (_definition, request) => ({
		accepted: [{ compilerId: 'session.visual', coveredChannels: ['visual'] }],
		rejected: [],
		complete: true,
		request
	}),
	async compile(definition, request) {
		compileCalls += 1;
		if (failNext) {
			failNext = false;
			throw new Error('session compiler failure');
		}
		return Object.freeze({
			plan: this.plan(definition, request),
			execution: Object.freeze({ executionComplete: true, executedChannels: ['visual'] }),
			artifacts: Object.freeze({ generation: compileCalls })
		});
	}
};
const session = new RealitySession({ artifactExecution, request: { required: ['visual'] } });
session.define({ id: 'tree', kind: 'biology.tree', payload: { age: 7 } });
const first = await session.apply();
assert.equal(first.sessionRevision, 1);
assert.equal(compileCalls, 1);
const committedHash = session.snapshot().committed.semanticHash;

session.patch('tree', [{ op: 'set', path: 'payload.age', value: 8 }], { affects: ['visual'] });
const staged = session.snapshot();
assert.equal(staged.revision, 1);
assert.equal(staged.dirty, true);
assert.equal(staged.pendingPatchCount, 1);
assert.notEqual(staged.draft.semanticHash, committedHash);

failNext = true;
await assert.rejects(() => session.apply(), /session compiler failure/);
const failed = session.snapshot();
assert.equal(failed.revision, 1);
assert.equal(failed.dirty, true);
assert.equal(failed.pendingPatchCount, 1);
assert.equal(failed.committed.semanticHash, committedHash);
assert.equal(session.engine.executor.ledger.get('tree', 'visual').state, 'stale');
assert.equal(compileCalls, 2);

const retried = await session.apply();
assert.equal(retried.sessionRevision, 2);
assert.equal(retried.execution.receipt.counts.executed, 1);
assert.equal(compileCalls, 3);
const committed = session.snapshot();
assert.equal(committed.dirty, false);
assert.equal(committed.pendingPatchCount, 0);
assert.notEqual(committed.committed.semanticHash, committedHash);

console.log('B"H | proceduralLanguageRealitySessionFailure.test passed');
