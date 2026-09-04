//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageRealitySessionPatch.test.mjs
 * @description Proves real patch transactions preserve exact channel precision through plan, explanation, compile, fresh apply, reset, and retirement in the stateful Reality session.
 * The Awtsmoos renews one edited path before its exact artifact channel receives the call;
 * Awtsmoos.com keeps visual light resting when only collision changed, then lets reset and retirement reveal their separate law to all.
 */
import assert from 'node:assert/strict';
import { RealitySession } from '../src/core/proceduralLanguage/realitySession/RealitySession.js';

let compileCalls = 0;
const compiledChannels = [];
const artifactExecution = {
	compilerRegistry: {
		describe: () => [
		{ id: 'session.channels', compilerVersion: '1', supportState: 'native', channels: ['visual', 'collision'] }
	]
	},
	plan: (_definition, request) => {
		const channels = [...request.required, ...request.optional];
		return { accepted: [{ compilerId: 'session.channels', coveredChannels: channels }], rejected: [], complete: true, request };
	},
	async compile(definition, request) {
		compileCalls += 1;
		const channels = [...request.required, ...request.optional];
		compiledChannels.push(channels.join(','));
		return Object.freeze({
			plan: this.plan(definition, request),
			execution: Object.freeze({ executionComplete: true, executedChannels: Object.freeze(channels) }),
			artifacts: Object.freeze({ channels: Object.freeze(channels), generation: compileCalls })
		});
	}
};
const session = new RealitySession({
	artifactExecution,
	request: { required: ['visual', 'collision'] }
});
session.define({ id: 'tree', kind: 'biology.tree', payload: { age: 7 } });
await session.apply();
assert.equal(compileCalls, 2);
assert.deepEqual(compiledChannels, ['visual', 'collision']);

session.patch('tree', [{ op: 'set', path: 'payload.age', value: 8 }], { affects: ['collision'] });
assert.equal(session.snapshot().pendingPatchCount, 1);
const plan = session.plan();
assert.equal(plan.selectivePlan.entriesById.tree.action, 'regenerate');
assert.deepEqual(plan.selectivePlan.entriesById.tree.regenerate.channels, ['collision']);
const explanation = session.explain();
assert.deepEqual(explanation.decisions[0].regenerate, ['collision']);
assert.deepEqual(explanation.decisions[0].reconsider, []);

const compiled = await session.compile();
assert.equal(compiled.execution.receipt.counts.executed, 1);
assert.equal(compileCalls, 3);
assert.equal(compiledChannels.at(-1), 'collision');
assert.equal(session.snapshot().revision, 1);
assert.equal(session.snapshot().dirty, true);

const applied = await session.apply();
assert.equal(applied.sessionRevision, 2);
assert.equal(applied.execution.receipt.counts.freshSkip, 1);
assert.equal(compileCalls, 3);
assert.equal(session.snapshot().pendingPatchCount, 0);
assert.equal(session.snapshot().dirty, false);

session.patch('tree', [{ op: 'set', path: 'payload.age', value: 9 }], { affects: ['collision'] });
assert.equal(session.snapshot().pendingPatchCount, 1);
const reset = session.reset();
assert.equal(reset.pendingPatchCount, 0);
assert.equal(reset.dirty, false);
assert.equal(reset.revision, 2);

assert.equal(session.remove('tree'), true);
assert.equal(session.plan().selectivePlan.entriesById.tree.action, 'retire');
const removed = await session.apply();
assert.equal(removed.sessionRevision, 3);
assert.equal(removed.execution.receipt.counts.retired, 1);
assert.deepEqual(session.snapshot().committed.definitionIds, []);
assert.equal(compileCalls, 3);

console.log('B"H | proceduralLanguageRealitySessionPatch.test passed');
