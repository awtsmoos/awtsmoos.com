//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createDemoScenarios.mjs
 * @description Executes the real selective artifact-lineage authorities to produce portable browser-demo evidence for distinct regeneration states.
 * The Awtsmoos renews each world before a public page may speak of change, retirement, doubt, or stale light;
 * Awtsmoos.com lets the deployed vessel display actual planning receipts, so no painted screenshot can impersonate runtime sight.
 */
import { createProceduralDefinition } from '../../src/core/proceduralLanguage/definition/createProceduralDefinition.js';
import { createProceduralPatchReceipt } from '../../src/core/proceduralLanguage/patch/createProceduralPatchReceipt.js';
import { WorldDependencyPolicyRegistry } from '../../src/core/proceduralLanguage/worldLineage/WorldDependencyPolicyRegistry.js';
import { WORLD_DEPENDENCY_DIRECTIONS } from '../../src/core/proceduralLanguage/worldLineage/WorldLineageProtocol.js';
import { createWorldSemanticSnapshot } from '../../src/core/proceduralLanguage/worldLineage/createWorldSemanticSnapshot.js';
import { createWorldChangeImpactReceipt } from '../../src/core/proceduralLanguage/worldLineage/createWorldChangeImpactReceipt.js';
import { ArtifactImpactPolicyRegistry } from '../../src/core/proceduralLanguage/artifactLineage/ArtifactImpactPolicyRegistry.js';
import { createSelectiveArtifactRegenerationPlan } from '../../src/core/proceduralLanguage/artifactLineage/createSelectiveArtifactRegenerationPlan.js';
import { summarizeDemoPlan } from './summarizeDemoPlan.mjs';

/** @description Creates one canonical demo Definition with optional semantic relationships. */
function createDemoDefinition(id, version = 1, relationships = []) {
	return createProceduralDefinition({
		id,
		kind: 'deployed-artifact-lineage-demo',
		payload: { version },
		relationships
	});
}

/** @description Creates the two-node world used to demonstrate direct and propagated impact. */
function createDemoWorld(rootVersion = 1) {
	return [
		createDemoDefinition('root', rootVersion),
		createDemoDefinition('leaf', 1, [
			{ id: 'uses-root', type: 'uses', from: 'leaf', to: 'root' }
		])
	];
}

/**
 * @description Produces the public deployment's real scenario evidence without compiler or cache mutation.
 * @returns {Readonly<object>} Frozen public-safe scenario summaries.
 */
export function createDemoScenarios() {
	const worldPolicyBinah = new WorldDependencyPolicyRegistry({
		uses: WORLD_DEPENDENCY_DIRECTIONS.SOURCE_DEPENDS_ON_TARGET
	});
	const artifactPolicyBinah = new ArtifactImpactPolicyRegistry({ uses: ['collision'] });
	const beforeDefinitions = createDemoWorld(1);
	const afterDefinitions = createDemoWorld(2);
	const beforeKeter = createWorldSemanticSnapshot(beforeDefinitions, { policyRegistry: worldPolicyBinah });
	const afterChochmah = createWorldSemanticSnapshot(afterDefinitions, { policyRegistry: worldPolicyBinah });
	const impactBinah = createWorldChangeImpactReceipt(beforeKeter, afterChochmah);
	const patchHod = createProceduralPatchReceipt(
		beforeDefinitions[0],
		afterDefinitions[0],
		[{ op: 'set', path: 'payload.version', value: 2 }],
		{ affects: ['collision'], reason: 'deployed demo shape change' }
	);
	const requestTiferes = { required: ['visual', 'collision'], optional: ['audio'] };
	const selectivePlan = createSelectiveArtifactRegenerationPlan({
		beforeSnapshot: beforeKeter,
		afterSnapshot: afterChochmah,
		worldImpact: impactBinah,
		request: requestTiferes,
		patchReceipts: [patchHod],
		policyRegistry: artifactPolicyBinah
	});
	const uncertaintyPlan = createSelectiveArtifactRegenerationPlan({
		beforeSnapshot: beforeKeter,
		afterSnapshot: afterChochmah,
		worldImpact: impactBinah,
		request: requestTiferes,
		policyRegistry: new ArtifactImpactPolicyRegistry()
	});
	const latentPatch = createProceduralPatchReceipt(
		beforeDefinitions[0],
		afterDefinitions[0],
		[{ op: 'set', path: 'payload.version', value: 2 }],
		{ affects: ['thumbnail'] }
	);
	const latentPlan = createSelectiveArtifactRegenerationPlan({
		beforeSnapshot: beforeKeter,
		afterSnapshot: afterChochmah,
		worldImpact: impactBinah,
		request: { required: ['visual'] },
		patchReceipts: [latentPatch],
		policyRegistry: new ArtifactImpactPolicyRegistry({ uses: [] })
	});
	const removalAfter = createWorldSemanticSnapshot(
		[createDemoDefinition('root')],
		{ policyRegistry: worldPolicyBinah }
	);
	const removalPlan = createSelectiveArtifactRegenerationPlan({
		beforeSnapshot: beforeKeter,
		afterSnapshot: removalAfter,
		worldImpact: createWorldChangeImpactReceipt(beforeKeter, removalAfter),
		request: requestTiferes,
		policyRegistry: artifactPolicyBinah
	});

	return Object.freeze({
		selective: summarizeDemoPlan(selectivePlan),
		uncertainty: summarizeDemoPlan(uncertaintyPlan),
		latent: summarizeDemoPlan(latentPlan),
		removal: summarizeDemoPlan(removalPlan)
	});
}
