//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageRealityExecutionFreshness.test.mjs
 * @description Proves evidence-backed freshness skips compilation only while the exact witness and live runtime materialization both remain present, and duplicate ids fail before mutation.
 * The Awtsmoos renews artifact and memory separately before rest can be called true;
 * Awtsmoos.com lets this test prove that persisted evidence alone cannot impersonate a living result, nor duplicate names alter freshness before judgment is due.
 */
import assert from 'node:assert/strict';
import { createArtifactRequest } from '../src/core/proceduralLanguage/artifact/createArtifactRequest.js';
import { createProceduralDefinition } from '../src/core/proceduralLanguage/definition/createProceduralDefinition.js';
import { ArtifactFreshnessLedger } from '../src/core/proceduralLanguage/realityExecution/ArtifactFreshnessLedger.js';
import { RealityArtifactExecutor } from '../src/core/proceduralLanguage/realityExecution/RealityArtifactExecutor.js';

function createCountedExecution() {
	const state = { compileCalls: 0 };
	const descriptor = Object.freeze({ id: 'visual-test', compilerVersion: '1', supportState: 'native', channels: ['visual'] });
	const plan = (definition, request) => Object.freeze({
		accepted: Object.freeze([Object.freeze({ compilerId: 'visual-test', accepted: true, coveredChannels: Object.freeze(['visual']) })]),
		rejected: Object.freeze([]), complete: true, request
	});
	return {
		state,
		compilerRegistry: { describe: () => Object.freeze([descriptor]) },
		plan,
		async compile(definition, request) {
			state.compileCalls += 1;
			return Object.freeze({
				plan: plan(definition, request),
				execution: Object.freeze({ executionComplete: true, executedCompilerIds: Object.freeze(['visual-test']), executedChannels: Object.freeze(['visual']) }),
				artifacts: Object.freeze({ 'visual-test': Object.freeze({ generation: state.compileCalls }) })
			});
		}
	};
}

function selectivePlan(definitionId, request) {
	return Object.freeze({
		planHash: 'freshness-proof', request,
		entries: Object.freeze([Object.freeze({
			definitionId, action: 'regenerate', request,
			regenerate: Object.freeze({ channels: Object.freeze(['visual']) }),
			dependencyEvidence: Object.freeze({ knownReasons: Object.freeze([]), unknownReasons: Object.freeze([]) })
		})])
	});
}

const definition = createProceduralDefinition({ id: '__proto__', kind: 'freshness-proof', payload: { version: 1 } });
const request = createArtifactRequest({ required: ['visual'], quality: 0.8 });
const artifactExecution = createCountedExecution();
const executor = new RealityArtifactExecutor({ artifactExecution });
const plan = selectivePlan(definition.id, request);

const first = await executor.execute(plan, [definition]);
assert.equal(artifactExecution.state.compileCalls, 1);
assert.equal(first.receipt.counts.executed, 1);
assert.equal(first.ledger.records[0].state, 'fresh');

const second = await executor.execute(plan, [definition]);
assert.equal(artifactExecution.state.compileCalls, 1);
assert.equal(second.receipt.counts.executed, 0);
assert.equal(second.receipt.counts.freshSkip, 1);
assert.strictEqual(second.artifacts[0].result, first.artifacts[0].result);
assert.deepEqual(executor.ledger.snapshot(), second.ledger);
assert(Object.isFrozen(second.ledger));

const beforeDuplicate = executor.ledger.snapshot();
await assert.rejects(() => executor.execute(plan, [definition, definition]), /Duplicate Reality Definition id/);
assert.deepEqual(executor.ledger.snapshot(), beforeDuplicate);
assert.equal(artifactExecution.state.compileCalls, 1);

const restoredLedger = new ArtifactFreshnessLedger(JSON.parse(JSON.stringify(second.ledger)));
const restoredExecutor = new RealityArtifactExecutor({ artifactExecution, ledger: restoredLedger });
const restored = await restoredExecutor.execute(plan, [definition]);
assert.equal(artifactExecution.state.compileCalls, 2);
assert.equal(restored.receipt.counts.executed, 1);
assert.equal(restored.receipt.counts.freshSkip, 0);

console.log('B"H | proceduralLanguageRealityExecutionFreshness.test passed');
