//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageRealityExecutionInvalidation.test.mjs
 * @description Proves precise freshness invalidation for causal upstream identity, request intent, compiler version, execution identity, explicit stale actions, and failed replacement compilation.
 * The Awtsmoos renews each true cause without making an unrelated Definition shake the whole world;
 * Awtsmoos.com makes every rebuild traceable, and when compilation fails it leaves stale truth named instead of yesterday's artifact falsely unfurled.
 */
import assert from 'node:assert/strict';
import { createArtifactRequest } from '../src/core/proceduralLanguage/artifact/createArtifactRequest.js';
import { createProceduralDefinition } from '../src/core/proceduralLanguage/definition/createProceduralDefinition.js';
import { RealityArtifactExecutor } from '../src/core/proceduralLanguage/realityExecution/RealityArtifactExecutor.js';

let compilerVersion = '1';
let compileCalls = 0;
let failNextCompile = false;
const artifactExecution = {
	compilerRegistry: { describe: () => [{ id: 'visual-test', compilerVersion, supportState: 'native', channels: ['visual'] }] },
	plan: (_definition, request) => ({ accepted: [{ compilerId: 'visual-test', coveredChannels: ['visual'] }], rejected: [], complete: true, request }),
	async compile(definition, request) {
		compileCalls += 1;
		if (failNextCompile) {
			failNextCompile = false;
			throw new Error('intentional compile failure');
		}
		return Object.freeze({ plan: this.plan(definition, request), execution: Object.freeze({ executedChannels: ['visual'], executionComplete: true }), artifacts: Object.freeze({ call: compileCalls }) });
	}
};

function definition(id, version) {
	return createProceduralDefinition({ id, kind: 'invalidation-proof', payload: { version } });
}

function regeneration(request) {
	return { planHash: 'dependency-proof', request, entries: [{
		definitionId: 'leaf', action: 'regenerate', request, regenerate: { channels: ['visual'] },
		dependencyEvidence: { knownReasons: [{ upstreamId: 'root', dependentId: 'leaf', relationshipType: 'uses' }], unknownReasons: [] }
	}] };
}

function staleAction(action, channels) {
	return { planHash: action, request: createArtifactRequest({ required: ['visual'] }), entries: [{
		definitionId: 'leaf', action,
		...(action === 'reconsider' ? { reconsider: { channels } } : {}),
		...(action === 'latent-stale' ? { latentStaleChannels: channels } : {}),
		...(action === 'retire' ? { retire: { channels } } : {})
	}] };
}

const executor = new RealityArtifactExecutor({ artifactExecution });
const request = createArtifactRequest({ required: ['visual'], quality: 0.5 });
const leaf = definition('leaf', 1);
const root1 = definition('root', 1);
const root2 = definition('root', 2);
const other1 = definition('other', 1);
const other2 = definition('other', 2);

await executor.execute(regeneration(request), [root1, leaf, other1]);
await executor.execute(regeneration(request), [root1, leaf, other2]);
assert.equal(compileCalls, 1, 'unrelated world change must stay fresh');
await executor.execute(regeneration(request), [root2, leaf, other2]);
assert.equal(compileCalls, 2, 'causal upstream change must rebuild');

compilerVersion = '2';
await executor.execute(regeneration(request), [root2, leaf, other2]);
assert.equal(compileCalls, 3, 'compiler version must invalidate');
const qualityRequest = createArtifactRequest({ required: ['visual'], quality: 0.9 });
await executor.execute(regeneration(qualityRequest), [root2, leaf, other2]);
assert.equal(compileCalls, 4, 'request intent must invalidate');
await executor.execute(regeneration(qualityRequest), [root2, leaf, other2], { executionIdentity: { renderer: 'v2' } });
assert.equal(compileCalls, 5, 'explicit execution identity must invalidate');

failNextCompile = true;
await assert.rejects(
	() => executor.execute(regeneration(qualityRequest), [root2, leaf, other2], { executionIdentity: { renderer: 'failure-proof' } }),
	/intentional compile failure/
);
assert.equal(compileCalls, 6);
assert.equal(executor.ledger.get('leaf', 'visual').state, 'stale');
const afterFailure = await executor.execute(regeneration(qualityRequest), [root2, leaf, other2], { executionIdentity: { renderer: 'failure-proof' } });
assert.equal(compileCalls, 7);
assert.equal(afterFailure.receipt.counts.executed, 1);

const beforeStale = compileCalls;
const reconsidered = await executor.execute(staleAction('reconsider', ['visual']), [root2, leaf, other2]);
assert.equal(reconsidered.receipt.counts.reconsidered, 1);
assert.equal(compileCalls, beforeStale);
assert.equal(executor.ledger.get('leaf', 'visual').state, 'stale');
const latent = await executor.execute(staleAction('latent-stale', ['visual']), [root2, leaf, other2]);
assert.equal(latent.receipt.counts.latentStale, 1);
const retired = await executor.execute(staleAction('retire', ['visual']), [root2, other2]);
assert.equal(retired.receipt.counts.retired, 1);
assert.equal(executor.ledger.get('leaf', 'visual'), null);

console.log('B"H | proceduralLanguageRealityExecutionInvalidation.test passed');
