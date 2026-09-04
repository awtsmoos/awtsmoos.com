//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageRealitySession.test.mjs
 * @description Proves the stateful Reality workflow against the real compiler registry, compilation cache, and artifact execution API: define, plan, explain, compile, apply, and stable no-op apply.
 * The Awtsmoos renews draft intention before compilation and committed world only after successful manifestation;
 * Awtsmoos.com lets one compiled possibility warm freshness, so apply may commit the same world without summoning the compiler twice from creation.
 */
import assert from 'node:assert/strict';
import { ProceduralCompilerCapabilityRegistry } from '../src/core/proceduralLanguage/capability/ProceduralCompilerCapabilityRegistry.js';
import { ProceduralCompilationCache } from '../src/core/proceduralLanguage/cache/ProceduralCompilationCache.js';
import { ProceduralArtifactExecutionApi } from '../src/core/proceduralLanguage/public/ProceduralArtifactExecutionApi.js';
import { RealitySession } from '../src/core/proceduralLanguage/realitySession/RealitySession.js';

const registry = new ProceduralCompilerCapabilityRegistry();
let compilerCalls = 0;
registry.register({
	id: 'session.visual',
	compilerVersion: '1',
	kinds: ['*'],
	channels: ['visual'],
	supportState: 'native'
}, ({ definition }) => {
	compilerCalls += 1;
	return Object.freeze({ definitionId: definition.id, generation: compilerCalls });
});

const executionApi = new ProceduralArtifactExecutionApi({
	compilerRegistry: registry,
	cache: new ProceduralCompilationCache({ maxEntries: 8 })
});
let artifactApiCompileCalls = 0;
const countedExecution = {
	compilerRegistry: registry,
	plan: (...args) => executionApi.plan(...args),
	async compile(...args) {
		artifactApiCompileCalls += 1;
		return executionApi.compile(...args);
	}
};
const session = new RealitySession({
	artifactExecution: countedExecution,
	request: { required: ['visual'] }
});

const initial = session.snapshot();
assert.equal(initial.revision, 0);
assert.equal(initial.dirty, false);
assert(Object.isFrozen(initial));

session.define({ id: 'tree', kind: 'biology.tree', payload: { age: 7 } });
const staged = session.snapshot();
assert.equal(staged.dirty, true);
assert.equal(staged.revision, 0);

const plan = session.plan();
assert.deepEqual(plan.worldImpact.addedIds, ['tree']);
assert.equal(plan.selectivePlan.entriesById.tree.action, 'regenerate');
assert.deepEqual(plan.selectivePlan.entriesById.tree.regenerate.channels, ['visual']);
const explanation = session.explain();
assert.equal(explanation.counts.added, 1);
assert.equal(explanation.decisions[0].action, 'regenerate');

const compiled = await session.compile();
assert.equal(compiled.committed, false);
assert.equal(compiled.execution.receipt.counts.executed, 1);
assert.equal(artifactApiCompileCalls, 1);
assert.equal(compilerCalls, 1);
assert.equal(session.snapshot().revision, 0);
assert.equal(session.snapshot().dirty, true);

const applied = await session.apply();
assert.equal(applied.committed, true);
assert.equal(applied.sessionRevision, 1);
assert.equal(applied.execution.receipt.counts.executed, 0);
assert.equal(applied.execution.receipt.counts.freshSkip, 1);
assert.equal(artifactApiCompileCalls, 1);
assert.equal(session.snapshot().dirty, false);
assert.equal(session.snapshot().pendingPatchCount, 0);

const noOp = await session.apply();
assert.equal(noOp.sessionRevision, 1);
assert.equal(noOp.worldImpact.affectedIds.length, 0);
assert.equal(artifactApiCompileCalls, 1);
assert.deepEqual(JSON.parse(JSON.stringify(session.snapshot())).committed.definitionIds, ['tree']);

console.log('B"H | proceduralLanguageRealitySession.test passed');
