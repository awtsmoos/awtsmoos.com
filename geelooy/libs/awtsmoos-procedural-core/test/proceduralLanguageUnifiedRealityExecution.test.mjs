//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageUnifiedRealityExecution.test.mjs
 * @description Proves the unified engine closes world impact, selective artifact lineage, real compiler registration, compilation cache, and freshness into one incremental execution loop.
 * The Awtsmoos renews world into artifact and artifact into proven rest without creating a second compiler throne;
 * Awtsmoos.com lets the existing trusted registry execute once, then lets exact freshness prevent a needless second groan.
 */
import assert from 'node:assert/strict';
import { ProceduralCompilerCapabilityRegistry } from '../src/core/proceduralLanguage/capability/ProceduralCompilerCapabilityRegistry.js';
import { ProceduralCompilationCache } from '../src/core/proceduralLanguage/cache/ProceduralCompilationCache.js';
import { ProceduralArtifactExecutionApi } from '../src/core/proceduralLanguage/public/ProceduralArtifactExecutionApi.js';
import { ArtifactImpactPolicyRegistry } from '../src/core/proceduralLanguage/artifactLineage/ArtifactImpactPolicyRegistry.js';
import { UnifiedRealityExecutionEngine } from '../src/core/proceduralLanguage/realityExecution/UnifiedRealityExecutionEngine.js';

const registry = new ProceduralCompilerCapabilityRegistry();
let compilerCalls = 0;
registry.register({
	id: 'reality.visual',
	compilerVersion: '1',
	kinds: ['*'],
	channels: ['visual'],
	supportState: 'native'
}, ({ definition, request, match }) => {
	compilerCalls += 1;
	return Object.freeze({ definitionId: definition.id, required: request.required, covered: match.coveredChannels, generation: compilerCalls });
});
const cache = new ProceduralCompilationCache({ maxEntries: 8 });
const artifactExecution = new ProceduralArtifactExecutionApi({ compilerRegistry: registry, cache });
let artifactApiCompileCalls = 0;
const countedArtifactExecution = {
	compilerRegistry: registry,
	plan: (...args) => artifactExecution.plan(...args),
	async compile(...args) {
		artifactApiCompileCalls += 1;
		return artifactExecution.compile(...args);
	}
};
const engine = new UnifiedRealityExecutionEngine({
	artifactExecution: countedArtifactExecution,
	artifactPolicyRegistry: new ArtifactImpactPolicyRegistry()
});
const afterDefinitions = [{ id: 'tree', kind: 'biology.tree', payload: { age: 7 } }];
const transition = {
	beforeDefinitions: [],
	afterDefinitions,
	request: { required: ['visual'] }
};

const first = await engine.executeWorldChange(transition);
assert.equal(first.worldImpact.addedIds[0], 'tree');
assert.equal(first.selectivePlan.entriesById.tree.action, 'regenerate');
assert.equal(first.execution.receipt.counts.executed, 1);
assert.equal(first.execution.receipt.counts.freshSkip, 0);
assert.equal(artifactApiCompileCalls, 1);
assert.equal(compilerCalls, 1);
assert.equal(cache.stats().entries, 1);

const second = await engine.executeWorldChange(transition);
assert.equal(second.execution.receipt.counts.executed, 0);
assert.equal(second.execution.receipt.counts.freshSkip, 1);
assert.equal(artifactApiCompileCalls, 1, 'freshness must bypass artifactExecution.compile entirely');
assert.equal(compilerCalls, 1);
assert.strictEqual(second.execution.artifacts[0].result, first.execution.artifacts[0].result);
assert.equal(engine.freshnessSnapshot().records[0].state, 'fresh');
assert.equal(JSON.parse(JSON.stringify(second.execution.receipt)).counts.freshSkip, 1);

console.log('B"H | proceduralLanguageUnifiedRealityExecution.test passed');
