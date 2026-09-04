//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ArtifactLineageProtocol.js
 * @description Names the selective artifact-regeneration planning receipt and its factual action/reason vocabulary without replacing compiler or cache authority.
 * The Awtsmoos renews each artifact before stale, retired, uncertain, or fresh can enter a finite plan;
 * Awtsmoos.com keeps every action named by evidence, so selective rebuilding serves truth instead of rebuilding all it can.
 */

export const ARTIFACT_REGENERATION_PLAN_SCHEMA = 'awtsmoos.procedural-artifact-regeneration-plan';
export const ARTIFACT_REGENERATION_PLAN_VERSION = 1;

export const ARTIFACT_LINEAGE_ACTIONS = Object.freeze({
	REGENERATE: 'regenerate',
	RETIRE: 'retire',
	RECONSIDER: 'reconsider',
	LATENT_STALE: 'latent-stale'
});

export const ARTIFACT_LINEAGE_REASONS = Object.freeze({
	DEFINITION_ADDED: 'definition-added',
	DEFINITION_REMOVED: 'definition-removed',
	DIRECT_PATCH_CHANNELS: 'direct-patch-channels',
	DIRECT_CONTENT_UNCERTAIN: 'direct-content-uncertain',
	DEPENDENCY_POLICY_CHANNELS: 'dependency-policy-channels',
	DEPENDENCY_POLICY_UNCERTAIN: 'dependency-policy-uncertain'
});

export const ARTIFACT_LINEAGE_DIAGNOSTICS = Object.freeze({
	PATCH_CHAIN_MISSING: 'ARTIFACT_PATCH_CHAIN_MISSING',
	PATCH_CHAIN_AMBIGUOUS: 'ARTIFACT_PATCH_CHAIN_AMBIGUOUS',
	PATCH_CHAIN_CYCLE: 'ARTIFACT_PATCH_CHAIN_CYCLE',
	WORLD_IMPACT_MISMATCH: 'ARTIFACT_WORLD_IMPACT_MISMATCH'
});
